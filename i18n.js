const floorballLanguageKey = "floorball4allLanguage";
const floorballPrivacyConsentKey = "floorball4allPrivacyConsent";

const floorballTranslations = {
  de: {
    homeTitle: "Floorball4all",
    compareTitlePage: "Ländervergleich - Floorball4all",
    adminLogin: "Admin Login",
    heroTitle: "Floorball4all Daten Übersicht",
    heroIntroTitle: "Herzlich Willkommen auf meiner interaktiven Weltkarte!",
    heroIntro:
      "Schön, dass du da bist! Mit dieser Karte kannst du entdecken, wo Floorball4all wirkt und welche Projektzahlen in den Ländern sichtbar werden.",
    heroHow: "Klicke ein Land an, suche gezielt nach Projekten oder vergleiche zwei Länder direkt miteinander.",
    heroCountry:
      "<strong>Länder-Infos auf einen Blick:</strong> Klicke einfach auf ein beliebiges Land auf der Karte. Du erhältst sofort spannende Statistiken zu den Projekten und der Arbeit von Floorball4all vor Ort.",
    heroCompare:
      "<strong>Projekte miteinander vergleichen:</strong> Möchtest du wissen, wie sich die Arbeit in verschiedenen Regionen unterscheidet? Wähle einfach zwei Länder aus, um deren Statistiken direkt miteinander zu vergleichen und die Entwicklungen zu analysieren.",
    heroOutro:
      "Tauche ein, klicke dich durch die Kontinente und erfahre, wie Unihockey das Leben von Kindern und Jugendlichen nachhaltig verändert. Viel Spass beim Entdecken!",
    worldButton: "Zur Weltkarte",
    compareButton: '<span class="ui-icon" aria-hidden="true">▦</span> Länder vergleichen',
    adminTitle: "Admin Bereich",
    password: "Passwort",
    signIn: "Einloggen",
    logout: '<span class="ui-icon" aria-hidden="true">↩</span> Ausloggen',
    country: "Land",
    countryInput: "Land eingeben",
    countryDropdown: "Land aus Dropdown auswählen",
    trainedCoaches: "Ausgebildete Trainer",
    trainerSince: "Seit wann werden Trainer ausgebildet",
    regularTrainings: "Regelmässige Trainings",
    reachedParticipants: "Erreichte Teilnehmer",
    saveData: "Daten speichern",
    panelTrainers: "Ausgebildete Trainer",
    panelStart: "Trainer-Ausbildung seit",
    panelTrainings: "Regelmässige Trainings",
    panelParticipants: "Erreichte Teilnehmer",
    loading: "Wird geladen...",
    activeCountries: "Aktive Länder zeigen",
    searchCountry: "Land suchen",
    searchCountryLabel: "Land nach Namen suchen",
    search: "Suchen",
    countryList: "Land aus Liste auswählen",
    countryNotFound: "Kein passendes Land gefunden.",
    resetMap: "Karte zurücksetzen",
    rights: "© 2026 Floorball4all Data Overview. Alle Rechte vorbehalten.",
    author: "Autor und Umsetzung: Joshua Moser.",
    contact: 'Kontakt: <a href="mailto:moser.joshuam.00@gmail.com">moser.joshuam.00@gmail.com</a>',
    sources:
      'Quellen: Die Weltkarten-SVG stammt von <a href="https://simplemaps.com/resources/svg-world" target="_blank" rel="noopener noreferrer">SimpleMaps</a>. Flaggen werden über Flagcdn geladen. Weltkarte und Flaggen werden ausschliesslich zur geografischen Orientierung und Darstellung der Länderinformationen verwendet. Die jeweiligen Rechte und Markenrechte liegen bei den entsprechenden Urhebern bzw. Rechteinhabern.',
    privacy:
      "Datenschutz: Diese Seite verwendet keine Tracking-Cookies. Die Schrift wird lokal über das Betriebssystem geladen, damit für Google Fonts keine IP-Adresse an Google übertragen wird.",
    disclaimer: "Keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der dargestellten Daten.",
    cookieTitle: "Datenschutz, Cookies & Sprache",
    cookieText:
      "Wir verwenden nur technisch notwendige lokale Speicherung, um deine Cookie- und Sprachauswahl zu merken. Es werden keine Tracking-Cookies gesetzt.",
    languageChoice: "Sprache wählen",
    german: "Deutsch",
    english: "Englisch",
    switchLanguage: "Zu Englisch wechseln",
    decline: "Ablehnen",
    accept: "Akzeptieren",
    compareTitle: "Ländervergleich",
    compareSubtitle: "Vergleiche die Floorball-Daten verschiedener Länder",
    back: '<span class="ui-icon" aria-hidden="true">←</span> Zurück',
    country1: "Land 1",
    country2: "Land 2",
    chooseCountry: "Bitte ein Land wählen...",
    chartTitle: "Datenvergleich",
    detailedComparison: "Detaillierter Vergleich",
    category: "Kategorie",
    trainers: "Trainer",
    trainings: "Trainings",
    participants: "Teilnehmer",
    loadingData: '<span class="loading-dot" aria-hidden="true"></span> Daten werden geladen...',
    missionKicker: "Floorball4all",
    missionTitle: "Mit Unihockey einen Unterschied sichtbar machen",
    missionText:
      "Die Datenübersicht zeigt, wo Floorball4all vor Ort wirkt und wie sich die Projektarbeit über Länder hinweg vergleichen lässt. So werden Einsätze, Trainings und Entwicklungen greifbar, ohne die menschliche Arbeit dahinter aus dem Blick zu verlieren.",
    missionPrimary: "Projektländer",
    missionSecondary: "Zur Floorball4all Website",
    loadError: "Fehler beim Laden der Daten!",
    noData: "Keine Angabe",
    syncAdded: "fehlende Länder wurden ins Google Sheet ergänzt.",
    syncAll: "Alle Länder sind bereits im Google Sheet.",
    logoutProgress: "Du wirst ausgeloggt...",
    loggedOut: "Ausgeloggt.",
    loginProgress: "Login wird geprüft...",
    loggedIn: "Eingeloggt. Länder werden geprüft...",
    savingData: "Daten werden gespeichert...",
    savedData: "Gespeichert. Google Sheet wurde aktualisiert.",
    adminRequestFailed: "Admin Anfrage fehlgeschlagen.",
    trainedTrainers: "Ausgebildete Trainer:",
    regularTrainingsLabel: "Regelmäßige Trainings:",
    totalParticipants: "Teilnehmer gesamt:",
    approx: "Ca.",
  },
  en: {
    homeTitle: "Floorball4all",
    compareTitlePage: "Country comparison - Floorball4all",
    adminLogin: "Admin Login",
    heroTitle: "Floorball4all Data Overview",
    heroIntroTitle: "Welcome to my interactive world map!",
    heroIntro:
      "It's great to have you here! Use this map to discover where Floorball4all is active and which project figures are visible in each country.",
    heroHow: "Click a country, search for projects, or compare two countries directly.",
    heroCountry:
      "<strong>Country information at a glance:</strong> Click any country on the map. You will immediately see interesting statistics, current figures, and deeper information about the projects and the work of Floorball4all on site.",
    heroCompare:
      "<strong>Compare projects:</strong> Want to know how the work differs across regions? Select two countries to compare their statistics directly and analyze the developments.",
    heroOutro:
      "Dive in, click through the continents, and discover how floorball sustainably changes the lives of children and young people. Have fun exploring!",
    worldButton: "Go to world map",
    compareButton: '<span class="ui-icon" aria-hidden="true">▦</span> Compare countries',
    adminTitle: "Admin Area",
    password: "Password",
    signIn: "Sign in",
    logout: '<span class="ui-icon" aria-hidden="true">↩</span> Sign out',
    country: "Country",
    countryInput: "Enter country",
    countryDropdown: "Select country from dropdown",
    trainedCoaches: "Trained coaches",
    trainerSince: "Since when coaches have been trained",
    regularTrainings: "Regular training sessions",
    reachedParticipants: "Reached participants",
    saveData: "Save data",
    panelTrainers: "Trained coaches",
    panelStart: "Coach training since",
    panelTrainings: "Regular training sessions",
    panelParticipants: "Reached participants",
    loading: "Loading...",
    activeCountries: "Show active countries",
    searchCountry: "Search country",
    searchCountryLabel: "Search country by name",
    search: "Search",
    countryList: "Select country from list",
    countryNotFound: "No matching country found.",
    resetMap: "Reset map",
    rights: "© 2026 Floorball4all Data Overview. All rights reserved.",
    author: "Author and implementation: Joshua Moser.",
    contact: 'Contact: <a href="mailto:moser.joshuam.00@gmail.com">moser.joshuam.00@gmail.com</a>',
    sources:
      'Sources: The world map SVG comes from <a href="https://simplemaps.com/resources/svg-world" target="_blank" rel="noopener noreferrer">SimpleMaps</a>. Flags are loaded via Flagcdn. The world map and flags are used only for geographic orientation and to display country information. All respective rights and trademarks belong to their owners.',
    privacy:
      "Privacy: This page does not use tracking cookies. The font is loaded locally through the operating system, so no IP address is transmitted to Google for Google Fonts.",
    disclaimer: "No guarantee is given for the accuracy, completeness, or timeliness of the displayed data.",
    cookieTitle: "Privacy, Cookies & Language",
    cookieText:
      "We only use technically necessary local storage to remember your cookie and language choice. No tracking cookies are set.",
    languageChoice: "Choose language",
    german: "German",
    english: "English",
    switchLanguage: "Switch to German",
    decline: "Decline",
    accept: "Accept",
    compareTitle: "Country comparison",
    compareSubtitle: "Compare Floorball data from different countries",
    back: '<span class="ui-icon" aria-hidden="true">←</span> Back',
    country1: "Country 1",
    country2: "Country 2",
    chooseCountry: "Please choose a country...",
    chartTitle: "Data comparison",
    detailedComparison: "Detailed comparison",
    category: "Category",
    trainers: "Coaches",
    trainings: "Training sessions",
    participants: "Participants",
    loadingData: '<span class="loading-dot" aria-hidden="true"></span> Loading data...',
    missionKicker: "Floorball4all",
    missionTitle: "Making a difference visible through floorball",
    missionText:
      "The data overview shows where Floorball4all is active on site and how project work can be compared across countries. It makes activities, training sessions, and developments easier to understand while keeping the people behind the work in view.",
    missionPrimary: "Project countries",
    missionSecondary: "Floorball4all website",
    loadError: "Error loading data!",
    noData: "No data",
    syncAdded: "missing countries were added to the Google Sheet.",
    syncAll: "All countries are already in the Google Sheet.",
    logoutProgress: "Signing out...",
    loggedOut: "Signed out.",
    loginProgress: "Checking login...",
    loggedIn: "Signed in. Checking countries...",
    savingData: "Saving data...",
    savedData: "Saved. Google Sheet was updated.",
    adminRequestFailed: "Admin request failed.",
    trainedTrainers: "Trained coaches:",
    regularTrainingsLabel: "Regular training sessions:",
    totalParticipants: "Total participants:",
    approx: "Approx.",
  },
};

const getStoredLanguage = () => {
  try {
    return localStorage.getItem(floorballLanguageKey);
  } catch (error) {
    return null;
  }
};

const getBrowserLanguage = () => ((navigator.language || "").toLowerCase().startsWith("en") ? "en" : "de");
const getLanguage = () => getStoredLanguage() || getBrowserLanguage();
const t = (key) => floorballTranslations[getLanguage()]?.[key] || floorballTranslations.de[key] || key;

const setText = (selector, key) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = t(key);
};

const setHtml = (selector, key) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = t(key);
};

const setPlaceholder = (selector, key) => {
  const element = document.querySelector(selector);
  if (element) element.placeholder = t(key);
};

const setAria = (selector, key) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("aria-label", t(key));
};

const setTitle = (selector, key) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("title", t(key));
};

const updateLanguageSwitchButtons = (language) => {
  document.querySelectorAll(".language-switch-button").forEach((button) => {
    const nextLanguageLabel = language === "en" ? "Deutsch" : "English";
    button.setAttribute("aria-label", t("switchLanguage"));
    button.setAttribute("title", t("switchLanguage"));
    button.innerHTML = `<span class="ui-icon" aria-hidden="true">◉</span><span>${nextLanguageLabel}</span>`;
  });
};

const setLabelText = (selector, key) => {
  const element = document.querySelector(selector);
  if (!element) return;
  const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = `${t(key)}\n            `;
};

const applyTranslations = () => {
  const language = getLanguage();
  document.documentElement.lang = language;
  updateLanguageSwitchButtons(language);

  if (document.querySelector(".world-map-section")) {
    document.title = t("homeTitle");
    setHtml(".admin-login-button", `<span class="ui-icon" aria-hidden="true">#</span> ${t("adminLogin")}`);
    setText(".banner-content h1", "heroTitle");
    setText(".banner-intro h2", "heroIntroTitle");
    setText(".banner-intro p:nth-of-type(1)", "heroIntro");
    setText(".banner-intro p:nth-of-type(2)", "heroHow");
    setText('.banner-button[href="#world"]', "worldButton");
    setHtml('.banner-button[href="compare.html"]', "compareButton");
    setText("#admin-title", "adminTitle");
    setLabelText(".admin-login-form label", "password");
    setText(".admin-login-form .admin-submit-button", "signIn");
    setHtml(".admin-logout-button", "logout");
    setLabelText(".admin-data-form label:nth-of-type(1)", "country");
    setPlaceholder(".admin-country-input", "countryInput");
    setAria(".admin-country-select", "countryDropdown");
    setLabelText(".admin-data-form label:nth-of-type(2)", "trainedCoaches");
    setLabelText(".admin-data-form label:nth-of-type(3)", "trainerSince");
    setLabelText(".admin-data-form label:nth-of-type(4)", "regularTrainings");
    setLabelText(".admin-data-form label:nth-of-type(5)", "reachedParticipants");
    setText(".admin-data-form .admin-submit-button", "saveData");
    setText(".side-panel li:nth-child(1) strong", "panelTrainers");
    setText(".side-panel li:nth-child(2) strong", "panelStart");
    setText(".side-panel li:nth-child(3) strong", "panelTrainings");
    setText(".side-panel li:nth-child(4) strong", "panelParticipants");
    setText(".loading", "loading");
    setText(".active-countries-toggle span", "activeCountries");
    setPlaceholder(".country-search-input", "searchCountry");
    setAria(".country-search-input", "searchCountryLabel");
    setAria(".country-search-button", "search");
    setAria(".mobile-country-select", "countryList");
    setText(".mobile-country-select option[value='']", "countryList");
    setAria(".map-reset-button", "resetMap");
    setTitle(".map-reset-button", "resetMap");
    setText(".legal-footer-inner p:nth-child(1)", "rights");
    setText(".legal-footer-inner p:nth-child(2)", "author");
    setHtml(".legal-footer-inner p:nth-child(3)", "contact");
    setHtml(".legal-footer-inner p:nth-child(4)", "sources");
    setText(".legal-footer-inner p:nth-child(5)", "privacy");
    setText(".legal-footer-inner p:nth-child(6)", "disclaimer");
    setText(".mission-section .section-kicker", "missionKicker");
    setText("#mission-title", "missionTitle");
    setText(".mission-section p:nth-of-type(2)", "missionText");
    setText(".mission-actions .primary-button", "missionPrimary");
    setText(".mission-actions .secondary-button", "missionSecondary");
  }

  if (document.querySelector(".compare-container") && !document.querySelector(".dashboard-container")) {
    document.title = t("compareTitlePage");
    setText(".banner-content h1", "compareTitle");
    setText(".banner-content p", "compareSubtitle");
    setHtml(".banner-button", "back");
    setText('label[for="country1-select"]', "country1");
    setText('label[for="country2-select"]', "country2");
    setText("#country1-select option[value='']", "chooseCountry");
    setText("#country2-select option[value='']", "chooseCountry");
    setText(".chart-wrapper h3", "chartTitle");
    setText(".table-section h2", "detailedComparison");
    setText(".comparison-table th:nth-child(1)", "category");
    if (!document.querySelector("#country1-select")?.value) setText("#table-country1", "country1");
    if (!document.querySelector("#country2-select")?.value) setText("#table-country2", "country2");
    setText(".comparison-table tbody tr:nth-child(1) strong", "trainers");
    setText(".comparison-table tbody tr:nth-child(2) strong", "trainings");
    setText(".comparison-table tbody tr:nth-child(3) strong", "participants");
    setHtml(".loading-info", "loadingData");
  }

  setText("#cookie-consent-title", "cookieTitle");
  setText(".cookie-consent-panel > div > p", "cookieText");
  setText(".language-choice legend", "languageChoice");
  setText(".language-choice label:nth-of-type(1) span", "german");
  setText(".language-choice label:nth-of-type(2) span", "english");
  setText(".cookie-consent-decline", "decline");
  setText(".cookie-consent-accept", "accept");

  document.querySelectorAll(".language-choice-input").forEach((input) => {
    input.checked = input.value === language;
  });
};

const setLanguage = (language) => {
  const nextLanguage = language === "en" ? "en" : "de";
  try {
    localStorage.setItem(floorballLanguageKey, nextLanguage);
  } catch (error) {
    console.warn("Sprachauswahl konnte nicht gespeichert werden.", error);
  }
  applyTranslations();
  window.dispatchEvent(new CustomEvent("floorball-language-change", { detail: { language: nextLanguage } }));
};

document.querySelectorAll(".language-choice-input").forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) setLanguage(input.value);
  });
});

document.querySelectorAll(".language-switch-button").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(getLanguage() === "en" ? "de" : "en");
  });
});

const closeCookieConsent = (choice) => {
  const selectedLanguage =
    Array.from(document.querySelectorAll(".language-choice-input")).find((input) => input.checked)?.value ||
    getLanguage();
  setLanguage(selectedLanguage);

  try {
    localStorage.setItem(floorballPrivacyConsentKey, choice);
  } catch (error) {
    console.warn("Datenschutz-Auswahl konnte nicht gespeichert werden.", error);
  }

  document.querySelector(".cookie-consent")?.classList.remove("show");
};

try {
  if (!localStorage.getItem(floorballPrivacyConsentKey)) {
    document.querySelector(".cookie-consent")?.classList.add("show");
  }
} catch (error) {
  document.querySelector(".cookie-consent")?.classList.add("show");
}

document.querySelector(".cookie-consent-accept")?.addEventListener("click", () => {
  closeCookieConsent("accepted");
});

document.querySelector(".cookie-consent-decline")?.addEventListener("click", () => {
  closeCookieConsent("declined");
});

applyTranslations();

window.floorballI18n = {
  applyTranslations,
  getLanguage,
  setLanguage,
  t,
};
