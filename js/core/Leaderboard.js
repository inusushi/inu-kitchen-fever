import { sanitizeNickname } from '../game/nickname.js';

const TABLE = 'leaderboard';

export class Leaderboard {
  constructor(cloud) {
    // Reusa el cliente de Supabase que ya monta CloudSync.
    this.cloud = cloud;
  }

  get configured() {
    return this.cloud.configured;
  }

  async submit({ levelId, nickname, coins, stars }) {
    if (!this.configured) return { ok: false, reason: 'not-configured' };
    const clean = sanitizeNickname(nickname);
    if (clean.length < 2) return { ok: false, reason: 'nickname-invalid' };
    try {
      const client = await this.cloud._getClient();
      const { error } = await client.from(TABLE).insert({
        level_id: levelId,
        nickname: clean,
        coins: Math.max(0, Math.round(coins)),
        stars: Math.max(0, Math.min(3, Math.round(stars))),
      });
      if (error) return { ok: false, reason: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err.message };
    }
  }

  async top(levelId, limit = 10) {
    if (!this.configured) return { ok: false, reason: 'not-configured', rows: [] };
    try {
      const client = await this.cloud._getClient();
      const { data, error } = await client
        .from(TABLE)
        .select('nickname, coins, stars')
        .eq('level_id', levelId)
        .order('coins', { ascending: false })
        .limit(limit);
      if (error) return { ok: false, reason: error.message, rows: [] };
      return { ok: true, rows: data || [] };
    } catch (err) {
      return { ok: false, reason: err.message, rows: [] };
    }
  }
}
