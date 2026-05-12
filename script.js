const map = document.querySelector("svg");
const worldMapSection = document.querySelector(".world-map");
const countries = map.querySelectorAll("path");
const sidePanel = document.querySelector(".side-panel");
const container = document.querySelector(".side-panel .container");
const closeBtn = document.querySelector(".close-btn");
const loading = document.querySelector(".loading");
const zoomInBtn = document.querySelector(".zoom-in");
const zoomOutBtn = document.querySelector(".zoom-out");
const zoomValueOutput = document.querySelector(".zoom-value");
const activeCountriesCheckbox = document.querySelector(
  ".active-countries-checkbox",
);
const countrySearchForm = document.querySelector(".country-search");
const countrySearchInput = document.querySelector(".country-search-input");
const countryNameOutlut = document.querySelector(".country-name");
const countryFlagOutput = document.querySelector(".country-flag");

let zoomLevel = 1;
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 2;
map.style.transformOrigin = "top center";

const updateZoom = () => {
  zoomValueOutput.innerText = `${Math.round(zoomLevel * 100)}%`;
  map.style.transform = `scale(${zoomLevel})`;
  if (worldMapSection) {
    worldMapSection.style.minHeight = `${85 * zoomLevel}vh`;
  }
  zoomInBtn.disabled = zoomLevel >= maxZoom;
  zoomOutBtn.disabled = zoomLevel <= minZoom;
};

zoomInBtn?.addEventListener("click", () => {
  zoomLevel = Math.min(maxZoom, +(zoomLevel + zoomStep).toFixed(2));
  updateZoom();
});

zoomOutBtn?.addEventListener("click", () => {
  zoomLevel = Math.max(minZoom, +(zoomLevel - zoomStep).toFixed(2));
  updateZoom();
});

updateZoom();
const trainercount = document.querySelector(".trainer-count");
const startyear = document.querySelector(".start-year");
const trainingcount = document.querySelector(".training-count");
const participantcount = document.querySelector(".participant-count");

let countryProfiles = {};
let normalizedCountryProfiles = {};
let showActiveCountries = false;
const selectedActiveCountryKeys = new Set();
const defaultCountryFill = "#000000";
const hoverCountryFill = "#ffffff";
const activeCountryFill = "#e5a92e";
const defaultCountryStroke = "#000000";
const activeCountryStroke = "#000000";
const defaultCountryStrokeWidth = "0.4";
const activeCountryStrokeWidth = "1.4";

const defaultProfile = {
  flag: "",
  trainerCount: "Keine Angabe",
  startYear: "Keine Angabe",
  trainingCount: "Keine Angabe",
  participantCount: "Keine Angabe",
};

const germanRegionNames = new Intl.DisplayNames(["de"], { type: "region" });

const manualGermanCountryNames = {
  BQBO: "Bonaire",
  BQSE: "Sint Eustatius",
  BQSA: "Saba",
};

const countryNameAliases = {
  AM: ["Armenia", "Armenien"],
  AZ: ["Azerbaijan", "Aserbaidschan"],
  BA: ["Bosnia and Herzegovina", "Bosnien und Herzegowina"],
  BD: ["Bangladesh", "Bangladesch"],
  BF: ["Burkina Faso"],
  BG: ["Bulgaria", "Bulgarien"],
  BI: ["Burundi"],
  BJ: ["Benin"],
  BN: ["Brunei Darussalam", "Brunei"],
  BO: ["Bolivia", "Bolivien"],
  BR: ["Brasil", "Brazil", "Brasilien"],
  BW: ["Botswana"],
  BY: ["Belarus", "Weissrussland"],
  BZ: ["Belize"],
  CA: ["Canada", "Kanada"],
  CF: ["Central African Republic", "Zentralafrikanische Republik"],
  CH: ["Switzerland", "Schweiz"],
  DE: ["Germany", "Deutschland"],
  EC: ["Ecuador"],
  ES: ["Spain", "Spanien"],
  FR: ["France", "Frankreich"],
  GB: ["United Kingdom", "Vereinigtes Koenigreich", "Grossbritannien"],
  HT: ["Haiti", "Haiti"],
  KE: ["Kenya", "Kenia"],
  KZ: ["Kazakhstan", "Kasachstan"],
  NL: ["Netherlands", "Niederlande", "Holland"],
  RO: ["Romania", "Rumaenien"],
  RU: ["Russia", "Russland", "Russian Federation"],
  TZ: ["Tanzania", "Tansania"],
  UG: ["Uganda"],
  US: [
    "United States",
    "United States of America",
    "USA",
    "Vereinigte Staaten",
  ],
};

const getCountryName = (country) =>
  country.getAttribute("name") || country.getAttribute("class") || "";

const normalizeCountryName = (name) =>
  `${name || ""}`
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getCountryKey = (country) =>
  normalizeCountryName(getCountryName(country));

const getGermanCountryName = (country) => {
  const countryCode = country.getAttribute("id");
  const svgCountryName = getCountryName(country);

  if (manualGermanCountryNames[countryCode]) {
    return manualGermanCountryNames[countryCode];
  }

  if (countryCode && /^[A-Z]{2}$/.test(countryCode)) {
    return germanRegionNames.of(countryCode) || svgCountryName;
  }

  return svgCountryName;
};

const getCountryAliases = (country) => {
  const countryCode = country.getAttribute("id");
  return [
    countryCode,
    getCountryName(country),
    getGermanCountryName(country),
    ...(countryNameAliases[countryCode] || []),
  ].filter(Boolean);
};

const getCountryProfile = (country) => {
  const aliases = getCountryAliases(country);
  const aliasProfile = aliases
    .map(
      (alias) =>
        normalizedCountryProfiles[normalizeCountryName(alias)] ||
        countryProfiles[alias],
    )
    .find(Boolean);

  return aliasProfile || defaultProfile;
};

const hasProfileAnswer = (answer) => {
  const normalizedAnswer = `${answer || ""}`.trim().toLowerCase();
  return (
    normalizedAnswer &&
    normalizedAnswer !== "n/a" &&
    normalizedAnswer !== "keine angabe"
  );
};

const isActiveCountry = (country) => {
  const profile = getCountryProfile(country);
  return (
    hasProfileAnswer(profile.trainerCount) ||
    hasProfileAnswer(profile.startYear) ||
    hasProfileAnswer(profile.trainingCount) ||
    hasProfileAnswer(profile.participantCount)
  );
};

const updateCountryFill = (country) => {
  const shouldHighlight =
    selectedActiveCountryKeys.has(getCountryKey(country)) ||
    (showActiveCountries && isActiveCountry(country));
  country.style.fill = shouldHighlight ? activeCountryFill : defaultCountryFill;
  country.style.stroke = shouldHighlight
    ? activeCountryStroke
    : defaultCountryStroke;
  country.style.strokeWidth = shouldHighlight
    ? activeCountryStrokeWidth
    : defaultCountryStrokeWidth;
};

const updateActiveCountryHighlights = () => {
  countries.forEach(updateCountryFill);
};

// Google Sheet CSV laden
const googleSheetUrl =
  "https://docs.google.com/spreadsheets/d/1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw/export?format=csv";

fetch(googleSheetUrl)
  .then((response) => response.text())
  .then((csv) => {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");

    // Spalten-Indizes finden
    const countryIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("land"),
    );
    const trainerIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("trainer"),
    );
    const startIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("startjahr"),
    );
    const trainingIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("trainings"),
    );
    const participantIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("teilnehmer"),
    );

    // Daten in countryProfiles laden
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      if (row[countryIndex]) {
        const countryName = row[countryIndex].trim();
        const profile = {
          trainerCount: row[trainerIndex]?.trim() || "Keine Angabe",
          startYear: row[startIndex]?.trim() || "Keine Angabe",
          trainingCount: row[trainingIndex]?.trim() || "Keine Angabe",
          participantCount: row[participantIndex]?.trim() || "Keine Angabe",
        };
        countryProfiles[countryName] = profile;
        normalizedCountryProfiles[normalizeCountryName(countryName)] = profile;
      }
    }
    console.log("Daten von Google Sheet geladen:", countryProfiles);
    updateActiveCountryHighlights();
  })
  .catch((error) =>
    console.error("Fehler beim Laden der Google Sheet:", error),
  );

closeBtn?.addEventListener("click", () => {
  sidePanel.classList.remove("side-panel-open");
});

activeCountriesCheckbox?.addEventListener("change", () => {
  showActiveCountries = activeCountriesCheckbox.checked;
  updateActiveCountryHighlights();
});

const openCountry = (country) => {
  loading.innerText = "Wird geladen...";
  container.classList.add("hide");
  loading.classList.remove("hide");

  const clickedCountryName = getCountryName(country);
  const germanCountryName = getGermanCountryName(country);

  sidePanel.classList.add("side-panel-open");
  countryFlagOutput.src = "";
  countryFlagOutput.alt = germanCountryName;

  fetch(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(clickedCountryName)}?fullText=true`,
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      const countryData = data[0] || {};
      const profile = getCountryProfile(country);

      countryNameOutlut.innerText = germanCountryName;
      if (countryData.flags?.png || countryData.flags?.svg) {
        countryFlagOutput.src = countryData.flags.png || countryData.flags.svg;
      } else {
        countryFlagOutput.src = "";
      }

      trainercount.innerText = profile.trainerCount;
      startyear.innerText = profile.startYear;
      trainingcount.innerText = profile.trainingCount;
      participantcount.innerText = profile.participantCount;

      loading.classList.add("hide");
      container.classList.remove("hide");
    })
    .catch((error) => {
      console.error("Error fetching country data:", error);
      countryNameOutlut.innerText = germanCountryName;
      countryFlagOutput.src = "";
      countryFlagOutput.alt = germanCountryName;
      const profile = getCountryProfile(country);
      trainercount.innerText = profile.trainerCount;
      startyear.innerText = profile.startYear;
      trainingcount.innerText = profile.trainingCount;
      participantcount.innerText = profile.participantCount;
      loading.classList.add("hide");
      container.classList.remove("hide");
    });
};

const findCountryByName = (searchTerm) => {
  const normalizedSearchTerm = normalizeCountryName(searchTerm);
  if (!normalizedSearchTerm) return null;

  return (
    Array.from(countries).find((country) => {
      const normalizedAliases =
        getCountryAliases(country).map(normalizeCountryName);
      return normalizedAliases.includes(normalizedSearchTerm);
    }) ||
    Array.from(countries).find((country) => {
      const normalizedAliases =
        getCountryAliases(country).map(normalizeCountryName);
      return normalizedAliases.some((alias) =>
        alias.includes(normalizedSearchTerm),
      );
    })
  );
};

countrySearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const foundCountry = findCountryByName(countrySearchInput.value);
  if (!foundCountry) {
    countrySearchInput.focus();
    countrySearchInput.select();
    return;
  }

  selectedActiveCountryKeys.add(getCountryKey(foundCountry));
  updateActiveCountryHighlights();
  openCountry(foundCountry);
});

countries.forEach((country) => {
  country.addEventListener("mouseenter", function () {
    if (!selectedActiveCountryKeys.has(getCountryKey(this))) {
      this.style.fill = hoverCountryFill;
    }
  });

  country.addEventListener("mouseout", function () {
    updateCountryFill(this);
  });

  country.addEventListener("click", function () {
    selectedActiveCountryKeys.add(getCountryKey(this));
    updateActiveCountryHighlights();
    openCountry(this);
  });
});
