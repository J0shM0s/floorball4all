const SESSION_COOKIE = "floorball4all_admin";
const DEFAULT_SHEET_ID = "1iBUeTag4z7L6-jZAaYyJck9_vimowPV1-3MaQqX2Dbw";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const jsonResponse = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

const base64UrlFromBytes = (bytes) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const base64UrlFromString = (value) => base64UrlFromBytes(textEncoder.encode(value));

const base64UrlToBytes = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const timingSafeEqual = (left, right) => {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
};

const importHmacKey = (secret) =>
  crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

const createHmacSignature = async (body, secret) => {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(body));
  return base64UrlFromBytes(new Uint8Array(signature));
};

const signSession = async (payload, env) => {
  const body = base64UrlFromString(JSON.stringify(payload));
  const signature = await createHmacSignature(body, env.SESSION_SECRET);
  return `${body}.${signature}`;
};

const verifySession = async (cookieHeader = "", env) => {
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (!cookie || !env.SESSION_SECRET) return false;

  const token = cookie.slice(`${SESSION_COOKIE}=`.length);
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expectedSignature = await createHmacSignature(body, env.SESSION_SECRET);
  if (!timingSafeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(textDecoder.decode(base64UrlToBytes(body)));
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

const getServiceAccount = (env) => {
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON fehlt in Cloudflare.");
  }

  return JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
};

const importGooglePrivateKey = (privateKey) => {
  const pem = privateKey.replace(/\\n/g, "\n");
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  return crypto.subtle.importKey(
    "pkcs8",
    base64UrlToBytes(base64.replace(/\+/g, "-").replace(/\//g, "_")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
};

const createGoogleJwt = async (serviceAccount) => {
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

  const unsignedToken = `${base64UrlFromString(JSON.stringify(header))}.${base64UrlFromString(
    JSON.stringify(claim),
  )}`;
  const key = await importGooglePrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    textEncoder.encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlFromBytes(new Uint8Array(signature))}`;
};

const getGoogleAccessToken = async (env) => {
  const serviceAccount = getServiceAccount(env);
  const assertion = await createGoogleJwt(serviceAccount);
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
    throw new Error(result.error?.message || "Google Sheet konnte nicht geaendert werden.");
  }

  return result;
};

const findHeaderIndex = (headers, searchTerm, fallback) => {
  const index = headers.findIndex((header) =>
    `${header || ""}`.toLowerCase().includes(searchTerm),
  );
  return index === -1 ? fallback : index;
};

const getSheetConfig = (env) => ({
  spreadsheetId: env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID,
  sheetName: env.GOOGLE_SHEET_NAME || "Sheet1",
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

const saveCountryData = async (data, env) => {
  const accessToken = await getGoogleAccessToken(env);
  const { spreadsheetId, sheetName } = getSheetConfig(env);
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

  if (rowIndex === -1) {
    const appendRange = encodeURIComponent(`${quoteSheetName(sheetName)}!A:Z`);
    await sheetsRequest(
      accessToken,
      `${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        body: JSON.stringify({
          values: [nextRow],
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
        values: [nextRow],
      }),
    },
  );
};

const syncCountriesData = async (countries, env) => {
  const accessToken = await getGoogleAccessToken(env);
  const { spreadsheetId, sheetName } = getSheetConfig(env);
  const rows = await getSheetRows(accessToken, spreadsheetId, sheetName);
  const headers = rows[0] || ["Land", "Trainer", "Startjahr", "Trainings", "Teilnehmer"];
  const columns = getSheetColumns(headers);
  const maxIndex = getMaxColumnIndex(columns);
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

export const onRequestPost = async ({ request, env }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Ungueltige Anfrage." });
  }

  const cookieHeader = request.headers.get("cookie") || "";

  if (body.action === "status") {
    return jsonResponse(200, {
      authenticated: await verifySession(cookieHeader, env),
    });
  }

  if (body.action === "login") {
    if (!env.ADMIN_PASSWORD_SHA256 || !env.SESSION_SECRET) {
      return jsonResponse(500, {
        error: "Admin Login ist in Cloudflare noch nicht eingerichtet.",
      });
    }

    const passwordHash = await sha256(body.password || "");
    if (!timingSafeEqual(passwordHash, env.ADMIN_PASSWORD_SHA256)) {
      return jsonResponse(401, { error: "Passwort ist falsch." });
    }

    const token = await signSession(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      },
      env,
    );

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
    if (!(await verifySession(cookieHeader, env))) {
      return jsonResponse(401, { error: "Bitte zuerst einloggen." });
    }

    try {
      const addedCount = await syncCountriesData(body.countries, env);
      return jsonResponse(200, { addedCount });
    } catch (error) {
      return jsonResponse(500, { error: error.message });
    }
  }

  if (body.action === "save") {
    if (!(await verifySession(cookieHeader, env))) {
      return jsonResponse(401, { error: "Bitte zuerst einloggen." });
    }

    if (!body.country) {
      return jsonResponse(400, { error: "Bitte ein Land auswaehlen." });
    }

    try {
      await saveCountryData(
        {
          country: body.country,
          trainerCount: body.trainerCount,
          startYear: body.startYear,
          trainingCount: body.trainingCount,
          participantCount: body.participantCount,
        },
        env,
      );
      return jsonResponse(200, { saved: true });
    } catch (error) {
      return jsonResponse(500, { error: error.message });
    }
  }

  return jsonResponse(400, { error: "Unbekannte Admin Aktion." });
};

export const onRequest = () => jsonResponse(405, { error: "Methode nicht erlaubt." });
