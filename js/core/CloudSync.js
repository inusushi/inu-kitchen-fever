import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../data/supabaseConfig.js';

const TABLE = 'game_saves';

export class CloudSync {
  constructor(save) {
    this.save = save;
    this.client = null;
    this.pushTimer = null;
  }

  get configured() {
    return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
  }

  async _getClient() {
    if (!this.configured) return null;
    if (!this.client) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return this.client;
  }

  async push() {
    if (!this.configured) return { ok: false, reason: 'not-configured' };
    try {
      const client = await this._getClient();
      const code = this.save.getOrCreateSyncCode();
      const { error } = await client
        .from(TABLE)
        .upsert({ sync_code: code, data: this.save.state, updated_at: new Date().toISOString() });
      if (error) return { ok: false, reason: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  }

  scheduleAutoPush() {
    if (!this.configured) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.push(), 1500);
  }

  async pull(code) {
    if (!this.configured) return { ok: false, reason: 'not-configured' };
    try {
      const client = await this._getClient();
      const { data, error } = await client.from(TABLE).select('data').eq('sync_code', code).maybeSingle();
      if (error) return { ok: false, reason: error.message };
      if (!data) return { ok: false, reason: 'not-found' };
      this.save.replaceProgress(data.data);
      this.save.setSyncCode(code);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  }
}
