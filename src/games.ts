import { xml2json } from "xml-js";
import type { Profile, ProfileName } from "./profiles";

type GeeklistItem = {
  _attributes: {
    objectid: string;
    objectname: string;
  };
};

type Geeklist = {
  geeklist: {
    item: GeeklistItem[];
  };
};

type UserRatings = Record<ProfileName, number | undefined>;

function calculateAverageUserRating(ratings: UserRatings): number {
  let total = 0;
  let count = 0;

  for (const rating of Object.values(ratings)) {
    if (rating == undefined) continue;
    total += rating;
    count += 1;
  }

  if (count == 0) {
    console.warn(
      "Can't calculate average: The game hasn't been rated by anyone D:",
    );
    return 0;
  }

  return total / count;
}

function calculateGreatestDifference(ratings: UserRatings): number {
  let highest = undefined;
  let lowest = undefined;

  for (const rating of Object.values(ratings)) {
    if (rating == undefined) continue;
    highest = Math.max(highest ?? rating, rating);
    lowest = Math.min(lowest ?? rating, rating);
  }

  if (highest != undefined && lowest != undefined) {
    return highest - lowest;
  } else {
    return 0;
  }
}

function calculateStandardDeviation(
  ratings: UserRatings,
  average: number,
): number {
  let total = 0;
  let count = 0;

  for (const rating of Object.values(ratings)) {
    if (rating == undefined) continue;
    total += Math.pow(rating - average, 2);
    count += 1;
  }

  if (count == 0) {
    console.warn(
      "Can't calculate deviation: The game hasn't been rated by anyone D:",
    );
    return 0;
  }

  return Math.sqrt(total / count);
}

export class Game {
  rank!: number;
  objectId!: number;
  name!: string;
  url!: string;
  ratings!: UserRatings;
  averageRating!: number;
  highestRating: number | undefined;
  lowestRating: number | undefined;
  greatestDifference!: number;
  standardDeviation!: number;
}

type UnplacedGame = Omit<Game, "rank">;

export async function getGamesByCollection(
  id: number,
  profiles: Profile[],
): Promise<Game[]> {
  const url = `/bgacache/geeklist/${id}`;
  const response = await fetch(url);

  const content = await response.text();
  const collection: Geeklist = JSON.parse(xml2json(content, { compact: true }));

  let unrankedGames: UnplacedGame[] = collection.geeklist.item.map(
    (item: GeeklistItem) => {
      const objectId = parseInt(item._attributes.objectid);
      const ratings = profiles.reduce((ratings, profile) => {
        ratings[profile.username] = profile.ratings.find(
          (rating) => rating.objectId == objectId,
        )?.rating;
        return ratings;
      }, {} as UserRatings);

      const average = calculateAverageUserRating(ratings);
      const lowest = Object.values(ratings).reduce(
        (currentLowest, rating) =>
          rating ? Math.min(currentLowest ?? rating, rating) : currentLowest,
        undefined,
      );
      const highest = Object.values(ratings).reduce(
        (currentHighest, rating) =>
          rating ? Math.max(currentHighest ?? rating, rating) : currentHighest,
        undefined,
      );

      return {
        objectId: objectId,
        name: item._attributes.objectname,
        url: "https://boardgamegeek.com/boardgame/" + item._attributes.objectid,
        ratings: ratings,
        averageRating: average,
        lowestRating: lowest,
        highestRating: highest,
        greatestDifference: calculateGreatestDifference(ratings),
        standardDeviation: calculateStandardDeviation(ratings, average),
      };
    },
  );

  const filterNotRatedByAll: boolean =
    document.querySelector<HTMLInputElement>("#united-we-stand")!.checked;

  if (filterNotRatedByAll) {
    unrankedGames = unrankedGames.filter((game) =>
      Object.values(game.ratings).every((rating) => rating != undefined),
    );
  }

  const games: Game[] = unrankedGames
    .sort((a, b) => b.averageRating - a.averageRating)
    .reduce((list, game, index) => {
      const previous = list.at(index - 1);
      const sameRatingAsPreviousPlace =
        game.averageRating == previous?.averageRating;
      list.push({
        rank: sameRatingAsPreviousPlace ? previous!.rank : index + 1,
        ...game,
      });
      return list;
    }, new Array<Game>());

  return games;
}
