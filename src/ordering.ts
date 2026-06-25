import type { Game } from "./games";
import { rebuildTableBody } from "./main";

const orderCriterions = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[id^='button-order-']"),
);

let orderBy = orderCriterions[0];
let ascending = false;

orderCriterions.forEach((node) => {
  node.innerText = "↕";
  node.addEventListener("click", () => {
    if (node == orderBy) {
      ascending = !ascending;
    } else {
      orderBy.innerText = "↕";
      orderBy = node;
    }

    node.innerText = ascending ? "↑" : "↓";
    rebuildTableBody();
  });
});

orderBy.innerText = "↓";

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

    return ((nestedA as number) ?? 0) - ((nestedB as number) ?? 0);
  };
}

function sortByKey(key: keyof Game) {
  return (a: Game, b: Game) => (a[key] as number) - (b[key] as number);
}

export function sortGames(games: Game[]): Game[] {
  const sortKey = orderBy.attributes.getNamedItem("sort-key")?.value;

  if (!sortKey) {
    return games;
  }

  const sortFunction = sortKey.includes("/")
    ? sortByPointer(sortKey.split("/"))
    : sortByKey(sortKey as keyof Game);

  const sorted = games.sort(sortFunction);

  return ascending ? sorted.reverse() : sorted;
}
