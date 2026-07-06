import "./style.css";
import { getGamesByCollection, type Game } from "./games.ts";
import { getProfileByName, PROFILE_NAMES, type Profile } from "./profiles.ts";
import "./ordering.ts";
import { sortGames } from "./ordering.ts";
import {
  calculateAverageRatingPerUser,
  calculateTotalAverageRating,
} from "./averages.ts";

const tableBody =
  document.querySelector<HTMLTableSectionElement>("#our-table-body")!;

function createTableCell(content: string, css?: string): HTMLTableCellElement {
  const cell = document.createElement("td");
  cell.innerText = content;
  if (css) {
    cell.className = css;
  }
  return cell;
}

const KBG_COLLECTION_ID = 283494;

let profiles: Profile[] = [];
let games: Game[] = [];

async function fetchLists() {
  profiles = [];
  for (const name of PROFILE_NAMES) {
    profiles.push(await getProfileByName(name));
  }
  console.log("profiles", profiles);

  games = await getGamesByCollection(KBG_COLLECTION_ID, profiles);
  console.log("games", games);

  rebuildTableBody();
}

export function rebuildTableBody() {
  tableBody.innerHTML = "";

  games = sortGames(games);
  games.forEach((game) => {
    const row = document.createElement("tr");
    row.appendChild(createTableCell("" + game.rank, "text-right"));

    const cell = document.createElement("td");
    cell.innerHTML = `<a href="${game.url}">${game.name}</a>`;
    row.appendChild(cell);

    row.appendChild(
      createTableCell(game.averageRating.toFixed(2), "text-right"),
    );
    row.appendChild(
      createTableCell(game.greatestDifference.toFixed(2), "text-right"),
    );
    row.appendChild(
      createTableCell(game.standardDeviation.toFixed(2), "text-right"),
    );
    for (const rating of Object.values(game.ratings)) {
      row.appendChild(createTableCell("" + (rating ?? "-"), "text-right"));
    }
    tableBody.appendChild(row);
  });

  document.getElementById("cell-total-average-ranking")!.innerText =
    `Ø ${calculateTotalAverageRating(games).toFixed(2)}`;

  calculateAverageRatingPerUser(games).forEach((rating, index) => {
    document.getElementById(
      "cell-average-user-ranking-" + PROFILE_NAMES[index],
    )!.innerText = `Ø ${rating.toFixed(2)}`;
  });
}

fetchLists();

document
  .querySelector<HTMLInputElement>("#united-we-stand")!
  .addEventListener("click", async () => {
    games = await getGamesByCollection(283494, profiles);
    rebuildTableBody();
  });

document
  .querySelector<HTMLButtonElement>("#button-reload-collection")!
  .addEventListener("click", () =>
    fetch(`/bgacache/geeklist/${KBG_COLLECTION_ID}?force=1`).then(() =>
      fetchLists(),
    ),
  );

PROFILE_NAMES.forEach((name) =>
  document
    .querySelector<HTMLButtonElement>("#button-reload-" + name)!
    .addEventListener("click", () =>
      fetch(`/bgacache/collection/${name}?force=1`).then(() => fetchLists()),
    ),
);
