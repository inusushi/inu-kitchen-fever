export function calculateStars(coinsEarned, starGoals) {
  let stars = 0;
  if (coinsEarned >= starGoals[0]) stars = 1;
  if (coinsEarned >= starGoals[1]) stars = 2;
  if (coinsEarned >= starGoals[2]) stars = 3;
  return stars;
}
