import "./style.css";
import { getGamesByCollection, type Game } from "./games.ts";
import { getProfileByName, PROFILE_NAMES, type Profile } from "./profiles.ts";
import "./ordering.ts";
import { rebuildTableBody } from "./table/table.ts";
import { sortBy } from "./ordering.ts";

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

  rebuildTableBody(games);
}

function addFilterRatedByAllListener() {
  document
    .querySelector<HTMLInputElement>("#united-we-stand")!
    .addEventListener("click", async () => {
      games = await getGamesByCollection(283494, profiles);
      rebuildTableBody(games);
    });
}

function addForceReloadListeners() {
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
}

function addOrderByListeners() {
  Array.from(
    document.querySelectorAll<HTMLButtonElement>("[id^='button-order-']"),
  ).forEach((node) => {
    node.innerText = "↕";
    node.addEventListener("click", () => {
      sortBy(node);
      rebuildTableBody(games);
    });
  });
}

function setup() {
  fetchLists();

  addFilterRatedByAllListener();

  addForceReloadListeners();

  addOrderByListeners();
}

setup();
