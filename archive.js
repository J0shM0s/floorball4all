const archiveUnlockKey = "floorball4all_archive_unlocked";
const archiveHistoryKey = "floorball4all_archive_history";
const archiveLastItemKey = "floorball4all_archive_last_item";
const archiveCode = "0000";
const archiveBaseUrl = ["https://sites.google.com", "view", "ubg66"].join("/");
const archiveHomeUrl = `${archiveBaseUrl}/home`;
const thumbnailBaseUrl = "https://image.thum.io/get/width/480/crop/320/noanimate/";

const featuredLinks = [
  {
    name: "ev.io",
    url: "https://ev.io/",
  },
  {
    name: "PolyTrack",
    url: "https://stuffed18.github.io/polytrack-0.4.1/",
  },
];

const featuredItems = [
  "4th and Goal",
  "QWOP",
  "CS Dust",
  "Slope",
  "Bounce Masters",
  "Bowmasters",
  "Tank Stars",
  "Bacon May Die",
  "Iron Snout",
  "House of Hazards",
  "Hop Ball",
  "Get 10 Ultimate",
  "Fishing.io",
  "Candy Crush",
  "2048",
  "1v1.lol",
  "12 MiniBattles",
  "8 Ball Pool",
  "Age of War",
  "Among Us",
  "Apple Worm",
  "Awesome Tanks",
  "Basket Random",
  "Basketball Stars",
  "Big Tower Tiny Square",
  "Bloxorz",
  "Bloons Tower Defense",
  "Boxing Random",
  "Drift Hunters",
  "Fireboy and Watergirl",
  "Moto X3M",
  "Rooftop Snipers",
  "Run 3",
  "Shell Shockers",
  "Slope Run",
  "Slither.io",
  "Smash Karts",
  "Snow Rider 3D",
  "Soccer Random",
  "Super Smash Flash 2",
  "10 Bullets",
  "10 More Bullets",
  "10 Minutes Till Dawn",
  "13 Days in Hell",
  "13 in 1 Solitaire",
  "100 Meter Sprint",
  "2048 Cupcakes",
  "2048 Multiplayer",
  "3 Pandas",
  "3 Slices",
  "40x Escape",
  "60 Second Burger Run",
  "A Dark Room",
  "A Dance of Fire And Ice",
  "A Grim Chase",
  "A Grim Love Tale",
  "Abandoned",
  "Abobo's Big Adventure",
  "Achievement Unlocked",
  "Achievement Unlocked 2",
  "Achievement Unlocked 3",
  "Adam And Eve",
  "Adventure Capitalist",
  "Agario Lite",
  "Age of Defense",
  "Age of Defense 3",
  "Age of Defense 4",
  "Airport Madness 3",
  "Alien Hominid",
  "Amateur Surgeon",
  "Angry Birds",
  "Animator Vs Animation 3",
  "Apple Shooter",
  "Aquapark Idle",
  "Arcane",
  "Armor Mayhem",
  "Armed With Wings",
  "Atari Breakout",
  "Awesome Conquest",
  "Awesome Planes",
  "Awesome Run",
  "Awesome Tanks 2",
  "Backflip Maniac",
  "Backrooms",
  "Bad Ice Cream",
  "Bad Piggies",
  "Bad Time Simulator",
  "Baldi's Basics",
  "Ball Blast",
  "Ball Mayhem",
  "Basket Bros",
  "Basketball Legends",
  "Basketball Physics",
  "Battle Gear",
  "Battle Gear 2",
  "Battlefield",
  "Beach Volleyball",
  "Ben 10 to The Rescue",
  "Big Neon Tower vs Tiny Square",
  "Bit Dungeon",
  "Black Hole.io",
  "Bloxorz",
  "Bloons",
  "Bloons Player Pack",
  "Bloons Super Monkey",
  "Bloons Tower Defense 2",
  "Bloons Tower Defense 3",
  "Bloons Tower Defense 4",
  "Bob The Robber",
  "Bomb It",
  "Bomb It 2",
  "Bonfire Idle",
  "Bottle Flip",
  "Bowmaster",
  "Boxel Rebound",
  "Boxhead 2play",
  "Boxhead The Rooms",
  "Brave Shorties 2",
  "Breakout",
  "Bricks Breaker",
  "Bubble Shooter",
  "Bubble Struggle 2",
  "Buckshot Roulette",
  "Building Rush",
  "Burrito Bison Revenge",
  "Burger Mania",
  "Cactus Mccoy",
  "Cactus Mccoy 2",
  "Call Of Duty",
  "Candy Clicker 2",
  "Cannon Basketball",
  "Can Your Pet",
  "Car Crash Test",
  "Car Driving",
  "Cart Ride Obby",
  "Chess",
  "Cookie Clicker",
  "Cut The Rope",
  "Dino Run",
  "Doodle Jump",
  "Duck Life",
  "Duck Life 2",
  "Duck Life 3",
  "Duck Life 4",
  "Earn to Die",
  "Electric Man 2",
  "Fancy Pants Adventure",
  "Five Nights at Freddy's",
  "Flappy Bird",
  "Friday Night Funkin",
  "Geometry Dash",
  "Getaway Shootout",
  "Happy Wheels",
  "Helix Jump",
  "HexGL",
  "Hill Climb Racing",
  "Impossible Quiz",
  "Jetpack Joyride",
  "Learn to Fly",
  "Madalin Stunt Cars 2",
  "Minecraft Classic",
  "Monkey Mart",
  "Moto X3M 2",
  "Moto X3M Pool Party",
  "Moto X3M Spooky Land",
  "Moto X3M Winter",
  "Paper.io",
  "Pixel Gun 3D",
  "Raft Wars",
  "Retro Bowl",
  "Riddle School",
  "Riddle Transfer",
  "Roblox",
  "Rocket League 2D",
  "Rooftop Shooters",
  "Run",
  "Run 2",
  "Short Life",
  "Short Ride",
  "Skywire",
  "Slope Ball",
  "Slope City",
  "Slope Tunnel",
  "Snake",
  "Snowball.io",
  "Soccer Physics",
  "Stick War",
  "Stick War 2",
  "Stickman Hook",
  "Subway Surfers",
  "Super Mario 63",
  "Super Mario Bros",
  "Super Mario Flash",
  "Super Mario World",
  "Superfighters",
  "Tank Trouble",
  "Temple Run 2",
  "Tetris",
  "The Impossible Quiz",
  "Tiny Fishing",
  "Vex",
  "Vex 2",
  "Vex 3",
  "Vex 4",
  "Vex 5",
  "Vex 6",
  "Vex 7",
  "World's Hardest Game",
  "Zombs Royale",
];

const lockSection = document.querySelector(".archive-lock");
const archiveArea = document.querySelector(".archive-area");
const lockForm = document.querySelector(".archive-lock-form");
const codeInput = document.querySelector(".archive-code-input");
const message = document.querySelector(".archive-message");
const searchForm = document.querySelector(".archive-search-form");
const searchInput = document.querySelector(".archive-search-input");
const archiveList = document.querySelector("#archive-list");
const archiveGrid = document.querySelector(".archive-grid");
const archiveCount = document.querySelector(".archive-count");
const featuredLinkList = document.querySelector(".archive-featured-links");
const archiveTabs = document.querySelectorAll(".archive-tab");
const archiveTabPanels = document.querySelectorAll(".archive-tab-panel");
const archiveFrame = document.querySelector(".archive-frame");
const archivePlayer = document.querySelector(".archive-player");
const currentTitle = document.querySelector(".archive-current-title");
const fullscreenButton = document.querySelector(".archive-fullscreen-button");
const recentGrid = document.querySelector(".archive-recent-grid");
const recentEmpty = document.querySelector(".archive-recent-empty");
const sourceLink = document.querySelector(".archive-source-link");

const isUnlocked = () => {
  try {
    return (
      sessionStorage.getItem(archiveUnlockKey) === "true" ||
      localStorage.getItem(archiveUnlockKey) === "true"
    );
  } catch (error) {
    return false;
  }
};

const setUnlocked = () => {
  try {
    sessionStorage.setItem(archiveUnlockKey, "true");
    localStorage.setItem(archiveUnlockKey, "true");
  } catch (error) {
    console.warn("Interner Bereich konnte nicht freigeschaltet werden.", error);
  }
};

const toItemPath = (name) =>
  `${archiveBaseUrl}/${name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

const getThumbnailUrl = (url) => `${thumbnailBaseUrl}${url}`;

const readStoredJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
};

const writeStoredJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Speichern nicht möglich.", error);
  }
};

const loadLastArchiveItem = () => readStoredJson(archiveLastItemKey, featuredLinks[0]);

const saveArchiveItem = ({ name, url }) => {
  const history = readStoredJson(archiveHistoryKey, []);
  const existingItem = history.find((item) => item.url === url);
  const nextItem = {
    name,
    url,
    openedAt: new Date().toISOString(),
    playCount: (existingItem?.playCount || 0) + 1,
  };
  const nextHistory = [nextItem, ...history.filter((item) => item.url !== url)].slice(0, 24);

  writeStoredJson(archiveHistoryKey, nextHistory);
  writeStoredJson(archiveLastItemKey, nextItem);
  renderRecentItems();
};

const handleImageError = (image, name) => {
  image.hidden = true;
  image.closest(".archive-card-image")?.setAttribute("data-fallback", name.slice(0, 2).toUpperCase());
};

const createArchiveCard = ({ name, url, isFeatured = false }) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isFeatured ? "archive-card archive-card-featured" : "archive-card";
  button.innerHTML = `
    <span class="archive-card-image" data-fallback="${name.slice(0, 2).toUpperCase()}">
      <img src="${getThumbnailUrl(url)}" alt="" loading="lazy" />
    </span>
    <span class="archive-card-title">${name}</span>
  `;
  button.querySelector("img")?.addEventListener("error", (event) => {
    handleImageError(event.currentTarget, name);
  });
  button.addEventListener("click", () => openUrl(url, name));
  return button;
};

const openItem = (name) => {
  const itemName = `${name || ""}`.trim();
  if (!itemName) {
    openUrl(archiveHomeUrl, "Archiv");
    return;
  }

  openUrl(toItemPath(itemName), itemName);
};

const openUrl = (url, name = "Archiv", options = {}) => {
  archiveFrame.src = url;
  if (currentTitle) currentTitle.textContent = name;
  if (options.save !== false) {
    saveArchiveItem({ name, url });
  }
  archivePlayer?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const showArchive = () => {
  lockSection?.classList.add("hide");
  archiveArea?.classList.remove("hide");
  if (archiveFrame?.getAttribute("src") === "about:blank") {
    const lastItem = loadLastArchiveItem();
    openUrl(lastItem.url, lastItem.name, { save: false });
  }
};

const activateArchiveTab = (tabName) => {
  if (tabName === "back") {
    window.location.href = "index.html";
    return;
  }

  archiveTabs.forEach((tab) => {
    const isActive = tab.dataset.archiveTab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", `${isActive}`);
  });

  archiveTabPanels.forEach((panel) => {
    panel.classList.toggle("hide", panel.id !== `archive-${tabName}-panel`);
  });
};

const getFilteredItems = () => {
  const query = `${searchInput?.value || ""}`.trim().toLowerCase();
  if (!query) return featuredItems;
  return featuredItems.filter((item) => item.toLowerCase().includes(query));
};

const renderArchiveGrid = () => {
  if (!archiveGrid) return;

  const items = getFilteredItems();
  archiveGrid.innerHTML = "";
  items.forEach((item) => {
    archiveGrid.appendChild(
      createArchiveCard({
        name: item,
        url: toItemPath(item),
      }),
    );
  });

  if (archiveCount) {
    archiveCount.textContent = `${items.length} Einträge`;
  }
};

const renderRecentItems = () => {
  if (!recentGrid) return;

  const history = readStoredJson(archiveHistoryKey, []);
  recentGrid.innerHTML = "";
  history.forEach((item) => {
    recentGrid.appendChild(createArchiveCard(item));
  });

  if (recentEmpty) {
    recentEmpty.hidden = history.length > 0;
  }
};

const renderItemPickers = () => {
  if (featuredLinkList) {
    featuredLinkList.innerHTML = "";
    featuredLinks.forEach((item) => {
      featuredLinkList.appendChild(createArchiveCard({ ...item, isFeatured: true }));
    });
  }

  if (archiveList) {
    archiveList.innerHTML = "";
    featuredItems.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      archiveList.appendChild(option);
    });
  }

  renderArchiveGrid();
  renderRecentItems();
};

lockForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (codeInput.value === archiveCode) {
    codeInput.value = "";
    setUnlocked();
    showArchive();
    searchInput?.focus();
    return;
  }

  if (message) message.textContent = "Falscher Code.";
  codeInput.select();
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderArchiveGrid();
});

searchInput?.addEventListener("input", renderArchiveGrid);

archiveTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateArchiveTab(tab.dataset.archiveTab));
});

fullscreenButton?.addEventListener("click", async () => {
  const target = archiveFrame || document.querySelector(".archive-frame-wrap");
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await target.requestFullscreen();
  } catch (error) {
    console.warn("Vollbildmodus konnte nicht geöffnet werden.", error);
  }
});

renderItemPickers();
if (sourceLink) sourceLink.href = archiveHomeUrl;

if (isUnlocked()) {
  showArchive();
} else {
  codeInput?.focus();
}
