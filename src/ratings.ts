type Rating = {
  rank: number;
};

export function calculateRatings(games: Game[]): Rating[] {
  const ratings: Rating[] = [];

  games.forEach((game) => {
    const gameRatings = [];
    playerRatings.value = playerRatings.value.filter(
      (playerRating) => playerRating.objectId === game.objectId,
    );

    playerRatings.value.forEach((playerRating) => {
      gameRatings.push(playerRating.rating);
      playerRatingStats[game.objectId + playerRating.username] = {
        rating: playerRating.rating,
        isMin:
          _.minBy(playerRatings.value, (r) => r.rating).rating ===
          playerRating.rating,
        isMax:
          _.maxBy(playerRatings.value, (r) => r.rating).rating ===
          playerRating.rating,
      };
      game[playerRating.username] = playerRating.rating;
    });
    if (gameRatings.length > 0) {
      game.averageRating =
        gameRatings.reduce((a, b) => a + b, 0) / gameRatings.length;
      game.highestDifference =
        Math.max(...gameRatings) - Math.min(...gameRatings);
      // Standardabweichung
      let total = 0;
      for (let i = 0; i < gameRatings.length; i++) {
        total += Math.pow(gameRatings[i] - game.averageRating, 2);
      }
      game.variance = Math.sqrt(total / gameRatings.length);
    }
    ratings.push(game);
  });

  ratings.forEach((rating) => {
    // Setze Platz
    rating.rank =
      ratings.filter((cmp) => cmp.averageRating > rating.averageRating).length +
      1;
  });

  return ratings;
}

export function calculateAverage(ratings) {
  computed(() => {
    if (ratings.value.length <= 0) {
      return 0;
    }
    return (
      ratings.value
        .map((r) => r.averageRating)
        .reduce((prev, next) => {
          return prev + next;
        }) / ratings.value.length
    );
  });
}
