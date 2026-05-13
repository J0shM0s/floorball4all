# Cloudflare Deployment

Diese Version ist fuer Cloudflare vorbereitet. Sie funktioniert sowohl mit
Cloudflare Pages Functions als auch mit einem Worker Deploy ueber Wrangler.

Der aktuelle `wrangler.toml` ist fuer `npx wrangler deploy` vorbereitet:
statische Dateien werden als Worker Assets ausgeliefert, `/api/admin` laeuft
ueber `src/index.js` und `functions/api/admin.js`.

## Cloudflare Pages / Worker Deploy

1. Repository zu GitHub pushen.
2. In Cloudflare `Workers & Pages` oeffnen.
3. GitHub Repository verbinden.
4. Wenn Cloudflare einen Deploy Command verlangt, nutze:

```txt
npx wrangler deploy
```

   Wenn du explizit Cloudflare Pages ohne Worker Deploy nutzt:
   - Framework preset: `None`
   - Build command: leer lassen
   - Build output directory: `.`
5. Deploy starten.

Wichtig: Lade das Projekt ueber GitHub hoch. Cloudflare Pages Functions werden
bei einem reinen Direct Upload aus dem Dashboard nicht unterstuetzt.

## Environment Variables

Unter `Settings` -> `Environment variables` diese Werte setzen:

```txt
SESSION_SECRET
ADMIN_PASSWORD_SHA256
GOOGLE_SERVICE_ACCOUNT_JSON
GOOGLE_SHEET_ID
GOOGLE_SHEET_NAME
```

`ADMIN_PASSWORD_SHA256` ist der SHA-256 Hash des Admin-Passworts.

In PowerShell kannst du ihn so erzeugen:

```powershell
$password = "DEIN_PASSWORT"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($password)
$hash = [System.Security.Cryptography.SHA256]::HashData($bytes)
[BitConverter]::ToString($hash).Replace("-", "").ToLower()
```

## Domain

1. Domain bei Cloudflare registrieren oder zu Cloudflare umziehen.
2. In deiner Pages-App `Custom domains` oeffnen.
3. Domain hinzufuegen, z. B. `deine-domain.ch`.
4. Cloudflare setzt DNS und HTTPS automatisch.

## Admin API

Das Frontend ruft jetzt `/api/admin` auf. Diese Route wird von `src/index.js`
an `functions/api/admin.js` weitergegeben.

`_routes.json` sorgt dafuer, dass nur `/api/*` als Function ausgefuehrt wird.
Normale HTML-, CSS- und JavaScript-Dateien bleiben statische Pages-Dateien.
