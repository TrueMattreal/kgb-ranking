import { xml2json } from "xml-js";
import type { Profile } from "./profiles";

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

type UserRating = { rating: number | undefined; user: string };

function calculateAverageUserRating(ratings: UserRating[]): number {
  let total = 0;
  let count = 0;

  for (const rating of ratings) {
    if (rating.rating == undefined) continue;
    total += rating.rating;
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

function calculateGreatestDifference(ratings: UserRating[]): number {
  let highest = undefined;
  let lowest = undefined;

  for (const rating of ratings) {
    if (rating.rating == undefined) continue;
    highest = Math.max(highest ?? rating.rating, rating.rating);
    lowest = Math.min(lowest ?? rating.rating, rating.rating);
  }

  if (highest != undefined && lowest != undefined) {
    return highest - lowest;
  } else {
    return 0;
  }
}

function calculateStandardDeviation(
  ratings: UserRating[],
  average: number,
): number {
  let total = 0;
  let count = 0;

  for (const rating of ratings) {
    if (rating.rating == undefined) continue;
    total += Math.pow(rating.rating - average, 2);
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

export type Game = {
  rank: number;
  objectId: number;
  name: string;
  url: string;
  ratings: UserRating[];
  averageRating: number;
  greatestDifference: number;
  standardDeviation: number;
};

type UnplacedGame = Omit<Game, "rank">;

export async function getGamesByCollection(
  id: number,
  profiles: Profile[],
): Promise<Game[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const url = `/bgacache/geeklist/${id}`;
  const response = await fetch(url);

  const content = await response.text();
  const collection: Geeklist = JSON.parse(xml2json(content, { compact: true }));

  let unrankedGames: UnplacedGame[] = collection.geeklist.item.map(
    (item: GeeklistItem) => {
      const objectId = parseInt(item._attributes.objectid);
      const ratings = profiles.map((profile) => {
        return {
          user: profile.username,
          rating: profile.ratings.find((rating) => rating.objectId == objectId)
            ?.rating,
        };
      });

      const average = calculateAverageUserRating(ratings);

      return {
        objectId: objectId,
        name: item._attributes.objectname,
        url: "https://boardgamegeek.com/boardgame/" + item._attributes.objectid,
        ratings: ratings,
        averageRating: average,
        greatestDifference: calculateGreatestDifference(ratings),
        standardDeviation: calculateStandardDeviation(ratings, average),
      };
    },
  );

  const filterNotRatedByAll: boolean =
    document.querySelector<HTMLInputElement>("#united-we-stand")!.checked;

  if (filterNotRatedByAll) {
    unrankedGames = unrankedGames.filter((game) =>
      game.ratings.every((userRating) => userRating.rating != undefined),
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
