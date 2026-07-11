import type { Game } from "./games";

let orderBy: HTMLButtonElement | undefined = undefined;
let ascending = false;

export function sortBy(node: HTMLButtonElement) {
  if (node == orderBy) {
    ascending = !ascending;
  } else {
    if (orderBy) orderBy.innerText = "↕";
    orderBy = node;
  }

  node.innerText = ascending ? "↑" : "↓";
}

function sortByPointer(pointer: string[]) {
  return (gameA: Game, gameB: Game) => {
    // eslint-disable-next-line
    let nestedA: any = gameA;
    // eslint-disable-next-line
    let nestedB: any = gameB;

    for (const part of pointer) {
      nestedA = part in nestedA ? nestedA[part] : nestedA;
      nestedB = nestedB[part];
    }

    return compare(nestedA, nestedB);
  };
}

// ratings is omitted since UserRatings are handled by `sortByPointer`
type BasicGameKey = keyof Omit<Game, "ratings">;

function sortByKey(key: BasicGameKey) {
  return (a: Game, b: Game) => compare(a[key], b[key]);
}

function compare<T extends string | number | undefined>(a: T, b: T): number {
  switch (typeof a) {
    case "string":
      return a.localeCompare((b as string) ?? "");
    case "number":
      return a - ((b as number) ?? 0);
    default:
      return -1;
  }
}

export function sortGames(games: Game[]): Game[] {
  const sortKey = orderBy?.attributes.getNamedItem("sort-key")?.value;

  if (!sortKey) {
    return games;
  }

  const sortFunction = sortKey.includes("/")
    ? sortByPointer(sortKey.split("/"))
    : sortByKey(sortKey as BasicGameKey);

  const sorted = games.sort(sortFunction);

  return ascending ? sorted.reverse() : sorted;
}
