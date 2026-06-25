import { xml2json } from "xml-js";

export const PROFILE_NAMES = [
  "M__x",
  "Mattreal",
  "SeriousScribbler",
  "tibosaeinbein",
];

type ProfileItem = {
  _attributes: {
    objectid: string;
  };
  stats: {
    rating: {
      _attributes: {
        value: string;
      };
    };
  };
};

type ProfileList = {
  items: {
    item: ProfileItem[];
  };
};

export type Profile = {
  username: string;
  ratings: Rating[];
};

export type Rating = {
  objectId: number;
  rating: number;
};

export async function getProfileByName(username: string): Promise<Profile> {
  const url = `/bgacache/collection/${username}`;
  const response = await fetch(url);

  const content = await response.text();
  const collection: ProfileList = JSON.parse(
    xml2json(content, { compact: true }),
  );

  const profile: Profile = { username, ratings: [] };

  collection.items.item.forEach((item: ProfileItem) => {
    profile.ratings.push({
      objectId: parseInt(item._attributes.objectid),
      rating: parseFloat(item.stats.rating._attributes.value),
    });
  });

  return profile;
}
