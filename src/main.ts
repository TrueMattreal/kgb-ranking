import "./style.css";
import { getGamesByCollection, Game } from "./games.ts";
import { getProfileByName, PROFILE_NAMES, type Profile } from "./profiles.ts";
import "./ordering.ts";
import { rebuildTableBody } from "./table/table.ts";
import { sortBy } from "./ordering.ts";

const KBG_COLLECTION_ID = 283494;

const CACHED_GAMES_KEY = "cached-games";

let profiles: Profile[] = [];
let games: Game[] = [];

async function fetchLists() {
  profiles = [];
  for (const name of PROFILE_NAMES) {
    profiles.push(await getProfileByName(name));
  }

  games = await getGamesByCollection(KBG_COLLECTION_ID, profiles);
  localStorage.setItem(CACHED_GAMES_KEY, JSON.stringify(games));

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

function loadCachedGames() {
  const cachedGames = localStorage.getItem(CACHED_GAMES_KEY);
  if (!cachedGames) return;
  try {
    const parsedGames = JSON.parse(cachedGames);
    if (Array.isArray(parsedGames)) {
      games = parsedGames;
    } else {
      console.error("Failed to parse cached games\n", cachedGames);
    }
  } catch (e) {
    console.error("Error while parsing cached games from local story\n", e);
  }
}

function setup() {
  try {
    loadCachedGames();

    rebuildTableBody(games);
  } catch (e) {
    console.error("Failed to build table from cached games\n", e);
  }

  fetchLists();

  addFilterRatedByAllListener();

  addForceReloadListeners();

  addOrderByListeners();
}

setup();
