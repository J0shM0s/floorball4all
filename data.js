(() => {
  const googleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw/export?format=csv";
  const sheetCacheKey = "floorball4allSheetCsv";
  const sheetCacheTimeKey = "floorball4allSheetCsvTime";
  const sheetCacheTtl = 15 * 60 * 1000;

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

  const getCachedSheetCsv = () => {
    try {
      const cachedCsv = localStorage.getItem(sheetCacheKey);
      const cachedAt = Number(localStorage.getItem(sheetCacheTimeKey));
      if (!cachedCsv || !cachedAt || Date.now() - cachedAt > sheetCacheTtl) return null;
      return cachedCsv;
    } catch (error) {
      return null;
    }
  };

  const getAnyCachedSheetCsv = () => {
    try {
      return localStorage.getItem(sheetCacheKey);
    } catch (error) {
      return null;
    }
  };

  const getSheetCacheInfo = () => {
    try {
      const cachedAt = Number(localStorage.getItem(sheetCacheTimeKey));
      return cachedAt ? { cachedAt, ageMs: Date.now() - cachedAt } : null;
    } catch (error) {
      return null;
    }
  };

  const setCachedSheetCsv = (csvText) => {
    try {
      localStorage.setItem(sheetCacheKey, csvText);
      localStorage.setItem(sheetCacheTimeKey, `${Date.now()}`);
    } catch (error) {
      console.warn("Sheet-Cache konnte nicht gespeichert werden.", error);
    }
  };

  const clearSheetCache = () => {
    try {
      localStorage.removeItem(sheetCacheKey);
      localStorage.removeItem(sheetCacheTimeKey);
    } catch (error) {
      console.warn("Sheet-Cache konnte nicht geleert werden.", error);
    }
  };

  const fetchSheetCsv = async ({ forceRefresh = false } = {}) => {
    const cachedCsv = forceRefresh ? null : getCachedSheetCsv();
    if (cachedCsv) return { csvText: cachedCsv, source: "fresh-cache" };

    try {
      const response = await fetch(googleSheetUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const csvText = await response.text();
      setCachedSheetCsv(csvText);
      return { csvText, source: "network" };
    } catch (error) {
      const staleCsv = getAnyCachedSheetCsv();
      if (staleCsv) return { csvText: staleCsv, source: "stale-cache" };
      throw error;
    }
  };

  const parseCountryProfiles = (csvText) => {
    const rows = parseCsv(csvText);
    const headers = rows[0] || [];
    const findHeader = (term) =>
      headers.findIndex((header) => header.toLowerCase().includes(term));

    const countryIndex = findHeader("land");
    const trainerIndex = findHeader("trainer");
    const startIndex = findHeader("startjahr");
    const trainingIndex = findHeader("trainings");
    const participantIndex = findHeader("teilnehmer");
    const countryProfiles = {};
    const normalizedCountryProfiles = {};

    rows.slice(1).forEach((row) => {
      const countryName = row[countryIndex]?.trim();
      if (!countryName) return;

      const profile = {
        name: countryName,
        trainerCount: row[trainerIndex]?.trim() || "Keine Angabe",
        startYear: row[startIndex]?.trim() || "Keine Angabe",
        trainingCount: row[trainingIndex]?.trim() || "Keine Angabe",
        participantCount: row[participantIndex]?.trim() || "Keine Angabe",
      };
      countryProfiles[countryName] = profile;
      normalizedCountryProfiles[normalizeCountryName(countryName)] = profile;
    });

    return { rows, countryProfiles, normalizedCountryProfiles };
  };

  const toNumber = (value) => {
    const parsed = Number.parseFloat(`${value || ""}`.replace(/'/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const loadCountryProfiles = async (options) => {
    const result = await fetchSheetCsv(options);
    return {
      ...result,
      ...parseCountryProfiles(result.csvText),
      cacheInfo: getSheetCacheInfo(),
    };
  };

  window.floorballData = {
    clearSheetCache,
    fetchSheetCsv,
    getSheetCacheInfo,
    googleSheetUrl,
    loadCountryProfiles,
    normalizeCountryName,
    parseCountryProfiles,
    parseCsv,
    sheetCacheTtl,
    toNumber,
  };
})();
