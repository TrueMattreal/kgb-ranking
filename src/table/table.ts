import { sortGames } from "./../ordering.ts";
import {
  calculateAverageRatingPerUser,
  calculateTotalAverageRating,
} from "./../averages.ts";
import type { Game } from "../games";
import { PROFILE_NAMES } from "../profiles";

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

export function rebuildTableBody(games: Game[]) {
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
      const css = ["text-right"];
      if (game.highestRating && game.highestRating == rating) {
        css.push("highest-user-rating");
      } else if (game.lowestRating && game.lowestRating == rating) {
        css.push("lowest-user-rating");
      }
      row.appendChild(createTableCell("" + (rating ?? "-"), css.join(" ")));
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
