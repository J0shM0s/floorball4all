const loadWorldMapSvg = async () => {
  const mapContainer = document.querySelector(".map-container");
  if (!mapContainer) return document.querySelector("svg");

  try {
    const response = await fetch("assets/world-map.svg");
    if (!response.ok) throw new Error("World map SVG could not be loaded");
    mapContainer.innerHTML = await response.text();
    return mapContainer.querySelector("svg");
  } catch (error) {
    console.error("Fehler beim Laden der Weltkarte:", error);
    const loader = mapContainer.querySelector(".map-loader");
    if (loader) loader.textContent = "Weltkarte konnte nicht geladen werden.";
    return null;
  }
};

const map = await loadWorldMapSvg();
if (!map) throw new Error("World map SVG missing");
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
const countrySearchOptions = document.querySelector("#country-search-options");
const countrySearchMessage = document.querySelector(".country-search-message");
const mobileCountrySelect = document.querySelector(".mobile-country-select");
const countryNameOutput = document.querySelector(".country-name");
const countryFlagOutput = document.querySelector(".country-flag");
const countryCompareLink = document.querySelector(".country-compare-link");
const summaryActiveCountries = document.querySelector(".summary-active-countries");
const summaryTrainers = document.querySelector(".summary-trainers");
const summaryParticipants = document.querySelector(".summary-participants");
const mapFilterSelect = document.querySelector(".map-filter-select");
const mapFilterMin = document.querySelector(".map-filter-min");
const cacheStatus = document.querySelector(".cache-status");
const sheetRefreshButton = document.querySelector(".sheet-refresh-button");
const adminLoginButton = document.querySelector(".admin-login-button");
const adminModal = document.querySelector(".admin-modal");
const adminCloseButton = document.querySelector(".admin-close-button");
const adminLoginForm = document.querySelector(".admin-login-form");
const adminDataForm = document.querySelector(".admin-data-form");
const adminLogoutButton = document.querySelector(".admin-logout-button");
const adminPasswordInput = document.querySelector(".admin-password-input");
const adminCountryInput = document.querySelector(".admin-country-input");
const adminCountrySelect = document.querySelector(".admin-country-select");
const adminTrainerInput = document.querySelector(".admin-trainer-input");
const adminStartInput = document.querySelector(".admin-start-input");
const adminTrainingInput = document.querySelector(".admin-training-input");
const adminParticipantInput = document.querySelector(".admin-participant-input");
const adminMessage = document.querySelector(".admin-message");

let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isMapDragging = false;
let suppressNextCountryClick = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 2;
map.style.transformOrigin = "center center";

const applyMapTransform = () => {
  map.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  map.classList.toggle("map-zoomed", zoomLevel > 1);
};

const updateZoom = () => {
  zoomValueOutput.innerText = `${Math.round(zoomLevel * 100)}%`;
  if (zoomLevel <= 1) {
    panX = 0;
    panY = 0;
  }
  applyMapTransform();
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

map.addEventListener("pointerdown", (event) => {
  if (zoomLevel <= 1 || event.button !== 0) return;
  isMapDragging = true;
  suppressNextCountryClick = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragOriginX = panX;
  dragOriginY = panY;
  map.classList.add("map-dragging");
  map.setPointerCapture(event.pointerId);
});

map.addEventListener("pointermove", (event) => {
  if (!isMapDragging) return;
  const nextPanX = dragOriginX + event.clientX - dragStartX;
  const nextPanY = dragOriginY + event.clientY - dragStartY;
  if (Math.abs(nextPanX - dragOriginX) > 3 || Math.abs(nextPanY - dragOriginY) > 3) {
    suppressNextCountryClick = true;
  }
  panX = nextPanX;
  panY = nextPanY;
  applyMapTransform();
});

map.addEventListener("pointerup", (event) => {
  if (!isMapDragging) return;
  isMapDragging = false;
  map.classList.remove("map-dragging");
  try {
    map.releasePointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture may already be gone when the browser ends the gesture.
  }
});

map.addEventListener("pointercancel", (event) => {
  isMapDragging = false;
  map.classList.remove("map-dragging");
  try {
    map.releasePointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture may already be gone when the browser cancels the gesture.
  }
});

updateZoom();
const trainercount = document.querySelector(".trainer-count");
const startyear = document.querySelector(".start-year");
const trainingcount = document.querySelector(".training-count");
const participantcount = document.querySelector(".participant-count");
const mapResetButton = document.querySelector(".map-reset-button");
if (activeCountriesCheckbox) activeCountriesCheckbox.checked = true;

let countryProfiles = {};
let normalizedCountryProfiles = {};
let showActiveCountries = true;
let adminCountriesSynced = false;
let currentMapFilter = "all";
let currentMapFilterMin = 0;
const selectedActiveCountryKeys = new Set();
const defaultCountryFill = "#173044";
const hoverCountryFill = "#ffffff";
const activeCountryFill = "#e5a92e";
const defaultCountryStroke = "#31536a";
const activeCountryStroke = "#061e2d";
const defaultCountryStrokeWidth = "0.4";
const activeCountryStrokeWidth = "1.4";
const getUiText = (key) => window.floorballI18n?.t(key) || key;
const getUiLanguage = () => window.floorballI18n?.getLanguage() || "de";

const defaultProfile = {
  flag: "",
  trainerCount: "Keine Angabe",
  startYear: "Keine Angabe",
  trainingCount: "Keine Angabe",
  participantCount: "Keine Angabe",
};

const setAdminMessage = (message) => {
  if (adminMessage) {
    adminMessage.textContent = message;
  }
};

const getAdminCountryNames = () =>
  Array.from(
    new Set([
      ...Array.from(countries).map(getGermanCountryName),
      ...Object.keys(countryProfiles),
    ]),
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "de"));

const callAdminApi = async (payload) => {
  const response = await fetch("/.netlify/functions/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || getUiText("adminRequestFailed"));
  }

  return result;
};

const getSelectedAdminCountry = () =>
  (adminCountryInput?.value || adminCountrySelect?.value || "").trim();

const fillAdminCountrySelect = () => {
  if (!adminCountrySelect) return;

  const currentValue = getSelectedAdminCountry();
  const countryNames = getAdminCountryNames();

  adminCountrySelect.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent =
    getUiLanguage() === "en" ? "Select country from dropdown" : "Land aus Dropdown wählen";
  adminCountrySelect.appendChild(placeholderOption);

  countryNames.forEach((countryName) => {
    const option = document.createElement("option");
    option.value = countryName;
    option.textContent = countryName;
    adminCountrySelect.appendChild(option);
  });

  if (currentValue && countryNames.includes(currentValue)) {
    adminCountrySelect.value = currentValue;
  }

  if (adminCountryInput && !adminCountryInput.value && adminCountrySelect.value) {
    adminCountryInput.value = adminCountrySelect.value;
  }

  updateAdminFormValues();
};

const syncAdminCountries = async () => {
  if (adminCountriesSynced) return;

  const countryNames = getAdminCountryNames();
  if (!countryNames.length) return;

  const result = await callAdminApi({
    action: "syncCountries",
    countries: countryNames,
  });

  adminCountriesSynced = true;
  setAdminMessage(
    result.addedCount > 0
      ? `${result.addedCount} ${getUiText("syncAdded")}`
      : getUiText("syncAll"),
  );
};

const updateAdminFormValues = () => {
  if (!adminCountryInput && !adminCountrySelect) return;

  const selectedCountry = getSelectedAdminCountry();
  const profile =
    countryProfiles[selectedCountry] ||
    normalizedCountryProfiles[normalizeCountryName(selectedCountry)] ||
    defaultProfile;
  adminTrainerInput.value =
    profile.trainerCount === "Keine Angabe" ? "" : profile.trainerCount;
  adminStartInput.value =
    profile.startYear === "Keine Angabe" ? "" : profile.startYear;
  adminTrainingInput.value =
    profile.trainingCount === "Keine Angabe" ? "" : profile.trainingCount;
  adminParticipantInput.value =
    profile.participantCount === "Keine Angabe" ? "" : profile.participantCount;
};

const showAdminDataForm = () => {
  adminLoginForm?.classList.add("hide");
  adminDataForm?.classList.remove("hide");
  fillAdminCountrySelect();
};

const showAdminLoginForm = () => {
  adminLoginForm?.classList.remove("hide");
  adminDataForm?.classList.add("hide");
};

const openAdminModal = async () => {
  adminModal?.classList.remove("hide");
  setAdminMessage("");

  try {
    const status = await callAdminApi({ action: "status" });
    if (status.authenticated) {
      showAdminDataForm();
      await syncAdminCountries();
    } else {
      showAdminLoginForm();
      adminPasswordInput?.focus();
    }
  } catch (error) {
    showAdminLoginForm();
    setAdminMessage(error.message);
  }
};

const closeAdminModal = () => {
  adminModal?.classList.add("hide");
  adminPasswordInput.value = "";
  setAdminMessage("");
};

const regionNamesByLanguage = {
  de: new Intl.DisplayNames(["de"], { type: "region" }),
  en: new Intl.DisplayNames(["en"], { type: "region" }),
};

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

const getLocalizedCountryName = (country) => {
  const countryCode = country.getAttribute("id");
  const svgCountryName = getCountryName(country);

  if (getUiLanguage() === "de" && manualGermanCountryNames[countryCode]) {
    return manualGermanCountryNames[countryCode];
  }

  if (countryCode && /^[A-Z]{2}$/.test(countryCode)) {
    return regionNamesByLanguage[getUiLanguage()]?.of(countryCode) || svgCountryName;
  }

  return svgCountryName;
};

const getGermanCountryName = (country) => {
  const countryCode = country.getAttribute("id");
  const svgCountryName = getCountryName(country);

  if (manualGermanCountryNames[countryCode]) {
    return manualGermanCountryNames[countryCode];
  }

  if (countryCode && /^[A-Z]{2}$/.test(countryCode)) {
    return regionNamesByLanguage.de.of(countryCode) || svgCountryName;
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

const getSortedLocalizedCountries = () =>
  Array.from(countries)
    .map((country) => ({
      country,
      name: getLocalizedCountryName(country),
      key: getCountryKey(country),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, getUiLanguage()));

const fillCountryPickers = () => {
  const localizedCountries = getSortedLocalizedCountries();

  if (countrySearchOptions) {
    countrySearchOptions.innerHTML = "";
    localizedCountries.forEach(({ name }) => {
      const option = document.createElement("option");
      option.value = name;
      countrySearchOptions.appendChild(option);
    });
  }

  if (mobileCountrySelect) {
    const currentValue = mobileCountrySelect.value;
    mobileCountrySelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getUiText("countryList");
    mobileCountrySelect.appendChild(placeholder);

    localizedCountries.forEach(({ name, key }) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = name;
      mobileCountrySelect.appendChild(option);
    });

    mobileCountrySelect.value = currentValue;
  }
};

const updateCountryAccessibility = () => {
  countries.forEach((country) => {
    country.setAttribute("aria-label", getLocalizedCountryName(country));
  });
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
    normalizedAnswer !== "keine angabe" &&
    normalizedAnswer !== "daten fehlen" &&
    normalizedAnswer !== "no data"
  );
};

const parseProfileNumber = (value) =>
  window.floorballData?.toNumber
    ? window.floorballData.toNumber(value)
    : Number.parseFloat(`${value || ""}`.replace(",", ".")) || 0;

const getProfileMetric = (profile, metric) => {
  if (metric === "trainers") return parseProfileNumber(profile.trainerCount);
  if (metric === "trainings") return parseProfileNumber(profile.trainingCount);
  if (metric === "participants") return parseProfileNumber(profile.participantCount);
  return 0;
};

const setProfileOutput = (element, value) => {
  if (!element) return;
  const hasValue = hasProfileAnswer(value);
  element.textContent = hasValue ? value : getUiText("noData");
  element.classList.toggle("is-missing", !hasValue);
};

const formatProfileCount = (value, unit) => {
  if (!hasProfileAnswer(value)) return getUiText("noData");
  return window.floorballData?.formatCountWithUnit
    ? window.floorballData.formatCountWithUnit(value, unit)
    : value;
};

const setProfileCountOutput = (element, value, unit) => {
  if (!element) return;
  const hasValue = hasProfileAnswer(value);
  element.textContent = hasValue ? formatProfileCount(value, unit) : getUiText("noData");
  element.classList.toggle("is-missing", !hasValue);
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

const matchesCurrentMapFilter = (country) => {
  const profile = getCountryProfile(country);
  if (currentMapFilter === "all") return true;
  if (currentMapFilter === "missing") return !isActiveCountry(country);
  return getProfileMetric(profile, currentMapFilter) >= currentMapFilterMin;
};

const updateCountryFill = (country) => {
  const passesFilter = matchesCurrentMapFilter(country);
  const shouldShowFilteredCountry =
    currentMapFilter === "missing" ? passesFilter : isActiveCountry(country) && passesFilter;
  const shouldHighlight =
    selectedActiveCountryKeys.has(getCountryKey(country)) ||
    (showActiveCountries && shouldShowFilteredCountry);
  country.classList.toggle("active-country", shouldHighlight);
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

const renderMapSummary = () => {
  const activeProfiles = Array.from(countries)
    .filter(isActiveCountry)
    .map(getCountryProfile);
  const totalTrainers = activeProfiles.reduce(
    (sum, profile) => sum + parseProfileNumber(profile.trainerCount),
    0,
  );
  const totalParticipants = activeProfiles.reduce(
    (sum, profile) => sum + parseProfileNumber(profile.participantCount),
    0,
  );

  if (summaryActiveCountries) summaryActiveCountries.textContent = `${activeProfiles.length}`;
  if (summaryTrainers) summaryTrainers.textContent = `${Math.round(totalTrainers)}`;
  if (summaryParticipants) summaryParticipants.textContent = `${Math.round(totalParticipants)}`;
};

const renderCacheStatus = (source = "") => {
  if (!cacheStatus) return;
  const info = window.floorballData?.getSheetCacheInfo?.();
  if (!info?.cachedAt) {
    cacheStatus.textContent = "";
    return;
  }

  const date = new Date(info.cachedAt);
  const sourceText = source === "stale-cache" ? "Offline-Daten" : "Daten";
  cacheStatus.textContent = `${sourceText} aktualisiert: ${date.toLocaleString(getUiLanguage())}`;
};

const getCountryFlagUrl = (country) => {
  const countryCode = country.getAttribute("id");
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return "";
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

const countryTooltip = document.createElement("div");
countryTooltip.className = "country-tooltip";
countryTooltip.setAttribute("aria-hidden", "true");
countryTooltip.innerHTML = `
  <img class="country-tooltip-flag" alt="" />
  <span>
    <span class="country-tooltip-name"></span>
    <span class="country-tooltip-details"></span>
  </span>
`;
worldMapSection?.appendChild(countryTooltip);
const countryTooltipFlag = countryTooltip.querySelector(".country-tooltip-flag");
const countryTooltipName = countryTooltip.querySelector(".country-tooltip-name");
const countryTooltipDetails = countryTooltip.querySelector(".country-tooltip-details");

const positionCountryTooltip = (event) => {
  if (!worldMapSection || !countryTooltip) return;
  const sectionBounds = worldMapSection.getBoundingClientRect();
  const offset = 14;
  countryTooltip.style.left = `${event.clientX - sectionBounds.left + offset}px`;
  countryTooltip.style.top = `${event.clientY - sectionBounds.top + offset}px`;
};

const showCountryTooltip = (country, event) => {
  const flagUrl = getCountryFlagUrl(country);
  const profile = getCountryProfile(country);
  const trainerCount = parseProfileNumber(profile.trainerCount);
  const participantCount = parseProfileNumber(profile.participantCount);
  countryTooltipName.textContent = getLocalizedCountryName(country);
  countryTooltipDetails.textContent = isActiveCountry(country)
    ? `${Math.round(trainerCount)} ${getUiText("trainers")} - ${Math.round(participantCount)} ${getUiText("participants")}`
    : getUiText("noData");
  if (flagUrl) {
    countryTooltipFlag.src = flagUrl;
    countryTooltipFlag.hidden = false;
  } else {
    countryTooltipFlag.src = "";
    countryTooltipFlag.hidden = true;
  }
  countryTooltip.classList.add("show");
  positionCountryTooltip(event);
};

const hideCountryTooltip = () => {
  countryTooltip.classList.remove("show");
};

const loadSheetProfiles = (options = {}) =>
  window.floorballData.loadCountryProfiles(options)
  .then((result) => {
    countryProfiles = result.countryProfiles;
    normalizedCountryProfiles = result.normalizedCountryProfiles;
    fillAdminCountrySelect();
    fillCountryPickers();
    renderMapSummary();
    renderCacheStatus(result.source);
    updateActiveCountryHighlights();
  })
  .catch((error) => {
    console.error("Fehler beim Laden der Google Sheet:", error);
    showCountrySearchMessage(getUiText("loadError"));
  });

loadSheetProfiles();

closeBtn?.addEventListener("click", () => {
  sidePanel.classList.remove("side-panel-open");
});

activeCountriesCheckbox?.addEventListener("change", () => {
  showActiveCountries = activeCountriesCheckbox.checked;
  updateActiveCountryHighlights();
});

const openCountry = (country) => {
  loading.innerText = getUiText("loading");
  container.classList.add("hide");
  loading.classList.remove("hide");

  const localizedCountryName = getLocalizedCountryName(country);
  const flagUrl = getCountryFlagUrl(country);
  const profile = getCountryProfile(country);

  sidePanel.classList.add("side-panel-open");
  countryFlagOutput.alt = localizedCountryName;
  countryFlagOutput.onerror = () => {
    countryFlagOutput.hidden = true;
  };
  countryFlagOutput.src = flagUrl;
  countryFlagOutput.hidden = !flagUrl;
  countryNameOutput.innerText = localizedCountryName;
  setProfileCountOutput(trainercount, profile.trainerCount, "Trainer");
  setProfileOutput(startyear, profile.startYear);
  setProfileCountOutput(trainingcount, profile.trainingCount, "Trainings");
  setProfileCountOutput(participantcount, profile.participantCount, "Teilnehmer");
  if (countryCompareLink) {
    countryCompareLink.href = `compare.html?country=${encodeURIComponent(localizedCountryName)}`;
    countryCompareLink.textContent = `${localizedCountryName} vergleichen`;
    countryCompareLink.hidden = !isActiveCountry(country);
  }
  loading.classList.add("hide");
  container.classList.remove("hide");
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

const clearCountrySearchMessage = () => {
  if (!countrySearchMessage) return;
  countrySearchMessage.textContent = "";
};

const showCountrySearchMessage = (message) => {
  if (!countrySearchMessage) return;
  countrySearchMessage.textContent = message;
};

const selectCountry = (country) => {
  selectedActiveCountryKeys.add(getCountryKey(country));
  updateActiveCountryHighlights();
  clearCountrySearchMessage();
  openCountry(country);
};

const resetMapView = () => {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  selectedActiveCountryKeys.clear();
  showActiveCountries = true;
  currentMapFilter = "all";
  currentMapFilterMin = 0;
  if (activeCountriesCheckbox) activeCountriesCheckbox.checked = true;
  if (countrySearchInput) countrySearchInput.value = "";
  if (mobileCountrySelect) mobileCountrySelect.value = "";
  if (mapFilterSelect) mapFilterSelect.value = "all";
  if (mapFilterMin) mapFilterMin.value = "";
  clearCountrySearchMessage();
  sidePanel?.classList.remove("side-panel-open");
  updateZoom();
  updateActiveCountryHighlights();
};

countrySearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const foundCountry = findCountryByName(countrySearchInput.value);
  if (!foundCountry) {
    showCountrySearchMessage(getUiText("countryNotFound"));
    countrySearchInput.focus();
    countrySearchInput.select();
    return;
  }

  selectCountry(foundCountry);
});

countrySearchInput?.addEventListener("input", clearCountrySearchMessage);

mobileCountrySelect?.addEventListener("change", () => {
  const selectedCountry = Array.from(countries).find(
    (country) => getCountryKey(country) === mobileCountrySelect.value,
  );
  if (selectedCountry) selectCountry(selectedCountry);
});

mapResetButton?.addEventListener("click", resetMapView);

mapFilterSelect?.addEventListener("change", () => {
  currentMapFilter = mapFilterSelect.value;
  if (mapFilterMin) {
    mapFilterMin.disabled = currentMapFilter === "all" || currentMapFilter === "missing";
  }
  updateActiveCountryHighlights();
});

mapFilterMin?.addEventListener("input", () => {
  currentMapFilterMin = Number.parseFloat(mapFilterMin.value) || 0;
  updateActiveCountryHighlights();
});

sheetRefreshButton?.addEventListener("click", async () => {
  sheetRefreshButton.disabled = true;
  if (cacheStatus) cacheStatus.textContent = "Daten werden aktualisiert...";
  try {
    await loadSheetProfiles({ forceRefresh: true });
  } finally {
    sheetRefreshButton.disabled = false;
  }
});

adminLoginButton?.addEventListener("click", openAdminModal);
adminCloseButton?.addEventListener("click", closeAdminModal);
adminModal?.addEventListener("click", (event) => {
  if (event.target === adminModal) {
    closeAdminModal();
  }
});
adminCountryInput?.addEventListener("input", () => {
  const typedCountry = adminCountryInput.value.trim();

  if (adminCountrySelect) {
    const matchingOption = Array.from(adminCountrySelect.options).find(
      (option) =>
        option.value &&
        normalizeCountryName(option.value) === normalizeCountryName(typedCountry),
    );
    adminCountrySelect.value = matchingOption?.value || "";
  }

  updateAdminFormValues();
});

window.addEventListener("floorball-language-change", () => {
  fillAdminCountrySelect();
  updateCountryAccessibility();
  fillCountryPickers();
  clearCountrySearchMessage();
  const openedCountryName = countryNameOutput?.textContent;
  if (!sidePanel?.classList.contains("side-panel-open") || !openedCountryName) return;

  const openedCountry = findCountryByName(openedCountryName);
  if (openedCountry) {
    const profile = getCountryProfile(openedCountry);
    const localizedName = getLocalizedCountryName(openedCountry);
    countryNameOutput.innerText = localizedName;
    countryFlagOutput.alt = localizedName;
    setProfileCountOutput(trainercount, profile.trainerCount, "Trainer");
    setProfileOutput(startyear, profile.startYear);
    setProfileCountOutput(trainingcount, profile.trainingCount, "Trainings");
    setProfileCountOutput(participantcount, profile.participantCount, "Teilnehmer");
    if (countryCompareLink) {
      countryCompareLink.href = `compare.html?country=${encodeURIComponent(localizedName)}`;
      countryCompareLink.textContent = `${localizedName} vergleichen`;
      countryCompareLink.hidden = !isActiveCountry(openedCountry);
    }
  }
});

adminCountrySelect?.addEventListener("change", () => {
  if (adminCountryInput && adminCountrySelect.value) {
    adminCountryInput.value = adminCountrySelect.value;
  }

  updateAdminFormValues();
});
adminLogoutButton?.addEventListener("click", async () => {
  adminLogoutButton.disabled = true;
  setAdminMessage(getUiText("logoutProgress"));

  try {
    await callAdminApi({ action: "logout" });
    adminCountriesSynced = false;
    showAdminLoginForm();
    setAdminMessage(getUiText("loggedOut"));
    adminPasswordInput?.focus();
  } catch (error) {
    setAdminMessage(error.message);
  } finally {
    adminLogoutButton.disabled = false;
  }
});

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = adminLoginForm.querySelector("button");
  submitButton.disabled = true;
  setAdminMessage(getUiText("loginProgress"));

  try {
    await callAdminApi({
      action: "login",
      password: adminPasswordInput.value,
    });
    adminPasswordInput.value = "";
    showAdminDataForm();
    setAdminMessage(getUiText("loggedIn"));
    await syncAdminCountries();
  } catch (error) {
    setAdminMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

adminDataForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = adminDataForm.querySelector(".admin-submit-button");
  submitButton.disabled = true;
  setAdminMessage(getUiText("savingData"));

  const country = getSelectedAdminCountry();
  const profile = {
    trainerCount: adminTrainerInput.value.trim(),
    startYear: adminStartInput.value.trim(),
    trainingCount: adminTrainingInput.value.trim(),
    participantCount: adminParticipantInput.value.trim(),
  };

  try {
    await callAdminApi({
      action: "save",
      country,
      ...profile,
    });

    countryProfiles[country] = {
      trainerCount: profile.trainerCount || "Keine Angabe",
      startYear: profile.startYear || "Keine Angabe",
      trainingCount: profile.trainingCount || "Keine Angabe",
      participantCount: profile.participantCount || "Keine Angabe",
    };
    normalizedCountryProfiles[normalizeCountryName(country)] =
      countryProfiles[country];
    fillAdminCountrySelect();
    updateActiveCountryHighlights();
    setAdminMessage(getUiText("savedData"));
  } catch (error) {
    setAdminMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

countries.forEach((country) => {
  country.setAttribute("tabindex", "0");
  country.setAttribute("role", "button");
  country.setAttribute("aria-label", getLocalizedCountryName(country));

  country.addEventListener("mouseenter", function (event) {
    if (!selectedActiveCountryKeys.has(getCountryKey(this))) {
      this.style.fill = hoverCountryFill;
    }
    showCountryTooltip(this, event);
  });

  country.addEventListener("mousemove", function (event) {
    positionCountryTooltip(event);
  });

  country.addEventListener("mouseout", function () {
    updateCountryFill(this);
    hideCountryTooltip();
  });

  country.addEventListener("click", function (event) {
    if (suppressNextCountryClick) {
      event.preventDefault();
      suppressNextCountryClick = false;
      return;
    }
    selectCountry(this);
  });

  country.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectCountry(this);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (adminModal && !adminModal.classList.contains("hide")) {
    closeAdminModal();
    adminLoginButton?.focus();
    return;
  }

  if (sidePanel?.classList.contains("side-panel-open")) {
    sidePanel.classList.remove("side-panel-open");
    return;
  }

  document.querySelector(".cookie-consent.show")?.classList.remove("show");
});

fillCountryPickers();
