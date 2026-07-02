import type { Game } from "./games";
import { PROFILE_NAMES, type ProfileName } from "./profiles";

type UserRatingsMap = {
  [K in ProfileName]: { totalRating: number; count: number };
};

export function calculateAverageRatingPerUser(games: Game[]): Array<number> {
  const averageUserRatings: UserRatingsMap = PROFILE_NAMES.reduce(
    (map, name) => {
      map[name] = { totalRating: 0, count: 0 };
      return map;
    },
    {} as UserRatingsMap,
  );

  games.forEach((game) => {
    PROFILE_NAMES.forEach((name) => {
      const rating = game.ratings[name];
      if (!rating) return;
      averageUserRatings[name].totalRating += rating;
      averageUserRatings[name].count += 1;
    });
  });

  return PROFILE_NAMES.map((name) =>
    averageUserRatings[name].count > 0
      ? averageUserRatings[name].totalRating / averageUserRatings[name].count
      : 0,
  );
}
