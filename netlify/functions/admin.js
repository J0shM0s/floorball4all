const crypto = require("crypto");

const SESSION_COOKIE = "floorball4all_admin";
const DEFAULT_SHEET_ID = "1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw";

const jsonResponse = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    ...headers,
  },
  body: JSON.stringify(body),
});

const base64Url = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const sha256 = (value) =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

const signSession = (payload) => {
  const body = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
};

const verifySession = (cookieHeader = "") => {
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (!cookie || !process.env.SESSION_SECRET) return false;

  const token = cookie.slice(`${SESSION_COOKIE}=`.length);
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(body)
    .digest("base64url");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

const getServiceAccount = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON fehlt in Netlify.");
  }

  return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
};

const createGoogleJwt = (serviceAccount) => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(claim),
  )}`;
  const privateKey = serviceAccount.private_key.replace(/\\n/g, "\n");
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(privateKey, "base64url");

  return `${unsignedToken}.${signature}`;
};

const getGoogleAccessToken = async () => {
  const serviceAccount = getServiceAccount();
  const assertion = createGoogleJwt(serviceAccount);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error_description || "Google Login fehlgeschlagen.");
  }

  return result.access_token;
};

const quoteSheetName = (sheetName) => `'${sheetName.replace(/'/g, "''")}'`;

const sheetsRequest = async (accessToken, path, options = {}) => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error?.message || "Google Sheet konnte nicht geändert werden.");
  }

  return result;
};

const findHeaderIndex = (headers, searchTerm, fallback) => {
  const index = headers.findIndex((header) =>
    `${header || ""}`.toLowerCase().includes(searchTerm),
  );
  return index === -1 ? fallback : index;
};

const getSheetConfig = () => ({
  spreadsheetId: process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID,
  sheetName: process.env.GOOGLE_SHEET_NAME || "Sheet1",
});

const getSheetRows = async (accessToken, spreadsheetId, sheetName) => {
  const encodedRange = encodeURIComponent(`${quoteSheetName(sheetName)}!A:Z`);
  const valuesPath = `${spreadsheetId}/values/${encodedRange}`;
  const sheet = await sheetsRequest(accessToken, valuesPath);
  return sheet.values || [];
};

const getSheetColumns = (headers) => ({
  countryIndex: findHeaderIndex(headers, "land", 0),
  trainerIndex: findHeaderIndex(headers, "trainer", 1),
  startIndex: findHeaderIndex(headers, "startjahr", 2),
  trainingIndex: findHeaderIndex(headers, "training", 3),
  participantIndex: findHeaderIndex(headers, "teilnehmer", 4),
});

const getMaxColumnIndex = (columns) =>
  Math.max(
    columns.countryIndex,
    columns.trainerIndex,
    columns.startIndex,
    columns.trainingIndex,
    columns.participantIndex,
  );

const normalizeCountWithUnit = (value, unit) => {
  const text = `${value || ""}`.trim();
  if (!text) return "";
  if (/[^\d\s'.,]/.test(text)) return text;

  const compactNumber = text.replace(/'/g, "").replace(/\s+/g, "");
  if (!/^\d+([,.]\d+)?$/.test(compactNumber)) return text;

  const number = Number.parseFloat(compactNumber.replace(",", "."));
  const formattedNumber = Number.isInteger(number) ? `${number}` : compactNumber.replace(".", ",");
  return `${formattedNumber} ${unit}`;
};

const normalizeProjectDataUnits = (row, columns) => {
  const nextRow = [...row];
  nextRow[columns.trainerIndex] = normalizeCountWithUnit(nextRow[columns.trainerIndex], "Trainer");
  nextRow[columns.trainingIndex] = normalizeCountWithUnit(nextRow[columns.trainingIndex], "Trainings");
  nextRow[columns.participantIndex] = normalizeCountWithUnit(nextRow[columns.participantIndex], "Teilnehmer");
  return nextRow;
};

const normalizeExistingSheetUnits = async (accessToken, spreadsheetId, sheetName, rows, columns, maxIndex) => {
  const normalizedRows = rows.map((row, index) => {
    const nextRow = [...row];
    while (nextRow.length <= maxIndex) {
      nextRow.push("");
    }

    return index === 0 ? nextRow : normalizeProjectDataUnits(nextRow, columns);
  });

  const changed = normalizedRows.some((row, rowIndex) =>
    row.some((value, columnIndex) => `${value || ""}` !== `${rows[rowIndex]?.[columnIndex] || ""}`),
  );

  if (!changed) return false;

  const updateRange = encodeURIComponent(`${quoteSheetName(sheetName)}!A1`);
  await sheetsRequest(
    accessToken,
    `${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({
        values: normalizedRows,
      }),
    },
  );

  return true;
};

const saveCountryData = async (data) => {
  const accessToken = await getGoogleAccessToken();
  const { spreadsheetId, sheetName } = getSheetConfig();
  const rows = await getSheetRows(accessToken, spreadsheetId, sheetName);
  const headers = rows[0] || ["Land", "Trainer", "Startjahr", "Trainings", "Teilnehmer"];
  const columns = getSheetColumns(headers);
  const maxIndex = getMaxColumnIndex(columns);
  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && `${row[columns.countryIndex] || ""}`.trim() === data.country,
  );
  const nextRow = rowIndex === -1 ? Array(maxIndex + 1).fill("") : [...rows[rowIndex]];

  while (nextRow.length <= maxIndex) {
    nextRow.push("");
  }

  nextRow[columns.countryIndex] = data.country;
  nextRow[columns.trainerIndex] = data.trainerCount || "";
  nextRow[columns.startIndex] = data.startYear || "";
  nextRow[columns.trainingIndex] = data.trainingCount || "";
  nextRow[columns.participantIndex] = data.participantCount || "";
  const normalizedRow = normalizeProjectDataUnits(nextRow, columns);

  if (rowIndex === -1) {
    const appendRange = encodeURIComponent(`${quoteSheetName(sheetName)}!A:Z`);
    await sheetsRequest(
      accessToken,
      `${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        body: JSON.stringify({
          values: [normalizedRow],
        }),
      },
    );
    return;
  }

  const sheetRowNumber = rowIndex + 1;
  const updateRange = encodeURIComponent(`${quoteSheetName(sheetName)}!A${sheetRowNumber}`);
  await sheetsRequest(
    accessToken,
    `${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({
        values: [normalizedRow],
      }),
    },
  );
};

const syncCountriesData = async (countries) => {
  const accessToken = await getGoogleAccessToken();
  const { spreadsheetId, sheetName } = getSheetConfig();
  const rows = await getSheetRows(accessToken, spreadsheetId, sheetName);
  const headers = rows[0] || ["Land", "Trainer", "Startjahr", "Trainings", "Teilnehmer"];
  const columns = getSheetColumns(headers);
  const maxIndex = getMaxColumnIndex(columns);
  await normalizeExistingSheetUnits(accessToken, spreadsheetId, sheetName, rows, columns, maxIndex);
  const existingCountries = new Set(
    rows
      .slice(1)
      .map((row) => `${row[columns.countryIndex] || ""}`.trim())
      .filter(Boolean),
  );
  const missingCountries = Array.from(
    new Set((countries || []).map((country) => `${country || ""}`.trim()).filter(Boolean)),
  ).filter((country) => !existingCountries.has(country));

  if (!missingCountries.length) {
    return 0;
  }

  const values = missingCountries.map((country) => {
    const row = Array(maxIndex + 1).fill("");
    row[columns.countryIndex] = country;
    return row;
  });
  const appendRange = encodeURIComponent(`${quoteSheetName(sheetName)}!A:Z`);

  await sheetsRequest(
    accessToken,
    `${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      body: JSON.stringify({ values }),
    },
  );

  return missingCountries.length;
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Methode nicht erlaubt." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Ungültige Anfrage." });
  }

  if (body.action === "status") {
    return jsonResponse(200, {
      authenticated: verifySession(event.headers.cookie || ""),
    });
  }

  if (body.action === "login") {
    if (!process.env.ADMIN_PASSWORD_SHA256 || !process.env.SESSION_SECRET) {
      return jsonResponse(500, {
        error: "Admin Login ist in Netlify noch nicht eingerichtet.",
      });
    }

    const passwordHash = sha256(body.password || "");
    if (
      passwordHash.length !== process.env.ADMIN_PASSWORD_SHA256.length ||
      !crypto.timingSafeEqual(
        Buffer.from(passwordHash),
        Buffer.from(process.env.ADMIN_PASSWORD_SHA256),
      )
    ) {
      return jsonResponse(401, { error: "Passwort ist falsch." });
    }

    const token = signSession({
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    });

    return jsonResponse(
      200,
      { authenticated: true },
      {
        "Set-Cookie": `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`,
      },
    );
  }

  if (body.action === "logout") {
    return jsonResponse(
      200,
      { authenticated: false },
      {
        "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
      },
    );
  }

  if (body.action === "syncCountries") {
    if (!verifySession(event.headers.cookie || "")) {
      return jsonResponse(401, { error: "Bitte zuerst einloggen." });
    }

    try {
      const addedCount = await syncCountriesData(body.countries);
      return jsonResponse(200, { addedCount });
    } catch (error) {
      return jsonResponse(500, { error: error.message });
    }
  }

  if (body.action === "save") {
    if (!verifySession(event.headers.cookie || "")) {
      return jsonResponse(401, { error: "Bitte zuerst einloggen." });
    }

    if (!body.country) {
      return jsonResponse(400, { error: "Bitte ein Land auswählen." });
    }

    try {
      await saveCountryData({
        country: body.country,
        trainerCount: body.trainerCount,
        startYear: body.startYear,
        trainingCount: body.trainingCount,
        participantCount: body.participantCount,
      });
      return jsonResponse(200, { saved: true });
    } catch (error) {
      return jsonResponse(500, { error: error.message });
    }
  }

  return jsonResponse(400, { error: "Unbekannte Admin Aktion." });
};
