import "./style.css";
import { getGamesByCollection, type Game } from "./games.ts";
import { getProfileByName, PROFILE_NAMES, type Profile } from "./profiles.ts";
import "./ordering.ts";
import { sortGames } from "./ordering.ts";
import { calculateAverageRatingPerUser } from "./averageRatingPerUser.ts";

const tableBody =
  document.querySelector<HTMLTableSectionElement>("#our-table-body")!;

function appendCell(row: HTMLTableRowElement, content: string, css?: string) {
  const cell = document.createElement("td");
  cell.innerText = content;
  if (css) {
    cell.className = css;
  }
  row.appendChild(cell);
}

let profiles: Profile[] = [];
let games: Game[] = [];

async function fetchLists() {
  profiles = [];
  for (const name of PROFILE_NAMES) {
    profiles.push(await getProfileByName(name));
  }
  console.log("profiles", profiles);

  games = await getGamesByCollection(283494, profiles);
  console.log("games", games);

  rebuildTableBody();
}

export function rebuildTableBody() {
  tableBody.innerHTML = "";

  games = sortGames(games);
  games.forEach((game) => {
    const row = document.createElement("tr");
    appendCell(row, "" + game.rank, "text-right");

    const cell = document.createElement("td");
    cell.innerHTML = `<a href="${game.url}">${game.name}</a>`;
    row.appendChild(cell);

    appendCell(row, "" + game.averageRating.toFixed(2), "text-right");
    appendCell(row, "" + game.greatestDifference.toFixed(2), "text-right");
    appendCell(row, "" + game.standardDeviation.toFixed(2), "text-right");
    for (const rating of Object.values(game.ratings)) {
      appendCell(row, "" + (rating ?? "-"), "text-right");
    }
    tableBody.appendChild(row);
  });

  const row = document.createElement("tr");
  appendCell(row, "");
  appendCell(row, "");
  appendCell(row, "");
  appendCell(row, "");
  appendCell(row, "");
  calculateAverageRatingPerUser(games).forEach((rating) => {
    appendCell(row, `Ø ${rating.toFixed(2)}`, "text-right");
  });
  tableBody.appendChild(row);
}

fetchLists();

document
  .querySelector<HTMLInputElement>("#united-we-stand")!
  .addEventListener("click", async () => {
    games = await getGamesByCollection(283494, profiles);
    rebuildTableBody();
  });
