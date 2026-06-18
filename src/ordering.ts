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

export function sortGames(games: Game[]): Game[] {
  const sortKey = orderBy.attributes.getNamedItem("sort-key")
    ?.value as keyof Game;
  // TODO implement sorting for strings (e.g. game name), NaN and rating by user
  const sorted = games.sort(
    (a: Game, b: Game) => (a[sortKey] as number) - (b[sortKey] as number),
  );

  return ascending ? sorted.reverse() : sorted;
}
