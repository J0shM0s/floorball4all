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
const countrySearchOptions = document.querySelector("#country-search-options");
const countrySearchMessage = document.querySelector(".country-search-message");
const mobileCountrySelect = document.querySelector(".mobile-country-select");
const countryNameOutlut = document.querySelector(".country-name");
const countryFlagOutput = document.querySelector(".country-flag");
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
const mapResetButton = document.querySelector(".map-reset-button");

let countryProfiles = {};
let normalizedCountryProfiles = {};
let showActiveCountries = false;
let adminCountriesSynced = false;
const selectedActiveCountryKeys = new Set();
const defaultCountryFill = "#000000";
const hoverCountryFill = "#ffffff";
const activeCountryFill = "#e5a92e";
const defaultCountryStroke = "#000000";
const activeCountryStroke = "#000000";
const defaultCountryStrokeWidth = "0.4";
const activeCountryStrokeWidth = "1.4";
const getUiText = (key) => window.floorballI18n?.t(key) || key;
const getUiLanguage = () => window.floorballI18n?.getLanguage() || "de";

const parseCsv = (csvText) => {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        value += '"';
        index++;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") index++;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
};

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
    getUiLanguage() === "en" ? "Select country from dropdown" : "Land aus Dropdown waehlen";
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
    normalizedAnswer !== "keine angabe"
  );
};

const formatProfileValue = (value) =>
  `${value || ""}`.trim() === "Keine Angabe" ? getUiText("noData") : value;

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

const googleSheetUrl =
  "https://docs.google.com/spreadsheets/d/1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw/export?format=csv";

fetch(googleSheetUrl)
  .then((response) => response.text())
  .then((csv) => {
    const rows = parseCsv(csv);
    const headers = rows[0] || [];

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

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
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
    fillAdminCountrySelect();
    fillCountryPickers();
    updateActiveCountryHighlights();
  })
  .catch((error) => {
    console.error("Fehler beim Laden der Google Sheet:", error);
    showCountrySearchMessage(getUiText("loadError"));
  });

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

  const clickedCountryName = getCountryName(country);
  const localizedCountryName = getLocalizedCountryName(country);

  sidePanel.classList.add("side-panel-open");
  countryFlagOutput.src = "";
  countryFlagOutput.alt = localizedCountryName;

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

      countryNameOutlut.innerText = localizedCountryName;
      if (countryData.flags?.png || countryData.flags?.svg) {
        countryFlagOutput.src = countryData.flags.png || countryData.flags.svg;
      } else {
        countryFlagOutput.src = "";
      }

      trainercount.innerText = formatProfileValue(profile.trainerCount);
      startyear.innerText = formatProfileValue(profile.startYear);
      trainingcount.innerText = formatProfileValue(profile.trainingCount);
      participantcount.innerText = formatProfileValue(profile.participantCount);

      loading.classList.add("hide");
      container.classList.remove("hide");
    })
    .catch((error) => {
      console.error("Error fetching country data:", error);
      countryNameOutlut.innerText = localizedCountryName;
      countryFlagOutput.src = "";
      countryFlagOutput.alt = localizedCountryName;
      const profile = getCountryProfile(country);
      trainercount.innerText = formatProfileValue(profile.trainerCount);
      startyear.innerText = formatProfileValue(profile.startYear);
      trainingcount.innerText = formatProfileValue(profile.trainingCount);
      participantcount.innerText = formatProfileValue(profile.participantCount);
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
  selectedActiveCountryKeys.clear();
  showActiveCountries = false;
  if (activeCountriesCheckbox) activeCountriesCheckbox.checked = false;
  if (countrySearchInput) countrySearchInput.value = "";
  if (mobileCountrySelect) mobileCountrySelect.value = "";
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
  const openedCountryName = countryNameOutlut?.textContent;
  if (!sidePanel?.classList.contains("side-panel-open") || !openedCountryName) return;

  const openedCountry = findCountryByName(openedCountryName);
  if (openedCountry) {
    const profile = getCountryProfile(openedCountry);
    countryNameOutlut.innerText = getLocalizedCountryName(openedCountry);
    countryFlagOutput.alt = getLocalizedCountryName(openedCountry);
    trainercount.innerText = formatProfileValue(profile.trainerCount);
    startyear.innerText = formatProfileValue(profile.startYear);
    trainingcount.innerText = formatProfileValue(profile.trainingCount);
    participantcount.innerText = formatProfileValue(profile.participantCount);
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

  country.addEventListener("mouseenter", function () {
    if (!selectedActiveCountryKeys.has(getCountryKey(this))) {
      this.style.fill = hoverCountryFill;
    }
  });

  country.addEventListener("mouseout", function () {
    updateCountryFill(this);
  });

  country.addEventListener("click", function () {
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
