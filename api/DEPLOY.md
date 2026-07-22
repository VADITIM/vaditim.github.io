# Comments API — deploy

The API lives in `api/` (ASP.NET Core 8 Minimal API). It is built into a container image by
GitHub Actions and run on Azure Container Apps. Nothing is built on your machine — you never
need Docker locally.

## How a deploy happens

1. You push to `dev` with a change under `api/**`.
2. [`.github/workflows/api-image.yml`](../.github/workflows/api-image.yml) builds `api/Dockerfile`
   on GitHub's runners and pushes `ghcr.io/vaditim/portfolio-api:latest` (plus a `sha-<commit>` tag).
3. You point the Container App at the new image's `sha-` tag, which creates a revision.

```sh
git push origin dev
```

Step 3 is manual. The workflow tags every build twice — `latest` and `sha-<full-commit-sha>` —
and the Container App is pinned to the **`sha-` tag, not `latest`**, because Azure does not poll
a tag for changes: an existing revision keeps running the digest it started with, so `latest`
silently never updates. Pinning also makes "which commit is live" answerable and rollback a
one-field edit.

After the Action goes green:

- **Container App → Application → Containers → Image and tag**
- Set it to `vaditim/portfolio-api:sha-<the commit sha you just pushed>`
  (full 40-char sha, e.g. `sha-e1afcc4a922eebffdc9fae4e68f4b9d9aacce1e7`)
- **Save as a new revision**

Then confirm the new code is actually serving before trusting it:

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://<your-container-app>.azurecontainerapps.io/
```

The old revision keeps answering for a minute or so while the new one starts, so a stale
response right after saving is expected — poll until it flips.

Watch the run under the repo's **Actions** tab. To rebuild without changing code, use
**Actions → Build API image → Run workflow** (the `workflow_dispatch` trigger).

## One-time setup

These are manual steps on github.com / portal.azure.com. Do them once, in order.

### 0. Get the workflow file onto GitHub

GitHub refuses pushes that add or change anything under `.github/workflows/` unless the
credential carries the `workflow` scope — VS Code's git integration does not have it, and the
push is rejected whole:

```
! [remote rejected] dev -> dev (refusing to allow an OAuth App to create or
  update workflow .github/workflows/api-image.yml without `workflow` scope)
```

Easiest way around it is to create the file through **github.com → Add file → Create new file**,
which is not subject to the scope check. Otherwise re-authenticate with a token that has both
`repo` and `workflow` (`git credential-manager github logout`, or a classic PAT).

Editing the workflow later has the same requirement.

### 1. Make the GHCR package pullable

The first workflow run creates the package as **private**, and Azure cannot pull it anonymously.
After that run: **github.com/VADITIM?tab=packages → portfolio-api → Package settings →
Change visibility → Public**.

Keeping it private is also fine, but then the Container App needs a registry credential
(a GitHub personal access token with `read:packages`) configured under its **Secrets** and
**Container → Registry** settings.

### 2. Point the Container App at the image

The Container App currently runs Microsoft's sample image. Replace it:

- **Container → Edit and deploy → your container image**
- Image source: **Docker Hub or other registries**
- Registry login server: `ghcr.io`
- Image and tag: `vaditim/portfolio-api:sha-<commit sha>` (see "How a deploy happens" — do not
  use `:latest`, Azure will never re-pull it)
- Target port: **8080** (the `dotnet/aspnet:8.0` base image listens there)

### 3. Set production configuration

Environment variables on the container. `IpHashSalt` and `AdminApiKey` are **required** — the app
throws on startup if either is missing.

| Variable | Value | Notes |
| --- | --- | --- |
| `DbProvider` | `SqlServer` | Anything else falls back to local SQLite |
| `ConnectionStrings__CommentsDb` | the Azure SQL connection string | Double underscore is how .NET nests config keys |
| `IpHashSalt` | a fresh random string | Salts the stored IP hashes; changing it later orphans existing dedupe data |
| `AdminApiKey` | a fresh random string | Sent as the `X-Admin-Key` header on `/admin/comments/*` |
| `FrontendOrigin` | `https://vaditim.github.io` | CORS allow-list; must match the site origin exactly, no trailing slash. Comma-separate to add more (e.g. `https://vaditim.github.io,http://localhost:5173` to debug the live API from `npm run dev`) |

Store `ConnectionStrings__CommentsDb`, `IpHashSalt` and `AdminApiKey` as Container App **secrets**
and reference them, rather than as plain environment values.

### 3a. Baseline the existing database for migrations (one time, before the next deploy)

The schema now moves with **EF Core migrations** (`api/Migrations/`), applied by
`db.Database.Migrate()` on startup — but only when `DbProvider=SqlServer`. Local SQLite still
uses `EnsureCreated()`, so a schema change there means deleting `api/comments.db` and letting it
rebuild; the migrations are generated for SQL Server and would emit the wrong column types.

The hosted database predates all of this: it already has a `Comments` table created by
`EnsureCreated()`, and no `__EFMigrationsHistory`. Left alone, `Migrate()` would try to run
`InitialCreate` and fail on "table already exists". Run this **once** against the Azure database
to record that migration as already applied, so only the delta runs:

```sql
CREATE TABLE [__EFMigrationsHistory] (
    [MigrationId] nvarchar(150) NOT NULL,
    [ProductVersion] nvarchar(32) NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
);
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260722190458_InitialCreate', N'8.0.29');
```

The next deploy then applies `20260722190759_AddRatingsAndVisitorUnlocks` on its own: it adds
`Ratings`, `VisitorUnlocks`, and the `CoarseFingerprintHash` / `EditCount` columns on `Comments`.
Every later schema change is `dotnet ef migrations add <Name> --project api` with
`DbProvider=SqlServer` set, and needs no manual step at all.

### 3b. Pin the app to a single replica (required by the unlock hub)

**Container App → Application → Scale → Scale rule / replica range: min 1, max 1.**

The classified-section unlock (see below) keeps its sessions and its SignalR groups in the
replica's memory. With two replicas the phone's `POST /unlock/{id}` can land on a different one
than the desktop's WebSocket, and the push silently goes nowhere. Lifting the cap means adding
a SignalR backplane (Azure SignalR Service) and moving `UnlockSessionStore` off-process — not
worth it for the traffic this gets.

Min 1 also removes the scale-to-zero cold start on the first comment load.

### 4. Rebuild the frontend against the live API

`src/modules/apiBaseUrl.ts` reads `VITE_COMMENTS_API_URL` and defaults to `http://localhost:5282`.
For the published site, set it at build time in `.env.production` (untracked):

```
VITE_COMMENTS_API_URL=https://<your-container-app>.azurecontainerapps.io
```

Then `npm run deploy` (builds to `docs/`, publishes to `gh-pages`).

## Verifying

```sh
curl https://<your-container-app>.azurecontainerapps.io/comments
```

A `200` with `[]` (or existing comments) means the container is up and the database is reachable.
Then post a comment from the live site and remove it again with the admin key:

```sh
curl -H "X-Admin-Key: <AdminApiKey>" https://<app>/admin/comments
curl -X DELETE -H "X-Admin-Key: <AdminApiKey>" https://<app>/admin/comments/<id>
```

## Endpoints

| Route | Purpose |
| --- | --- |
| `GET /` | Health probe target. Container Apps kills the replica without it |
| `POST /visitor/session` | Resolves who the visitor is once, for all three features (see below) |
| `GET/POST/PUT/DELETE /comments/*` | Guestbook (see `src/modules/extraComments.ts`). `PUT /comments/mine` allows exactly one edit, then `409` |
| `GET/POST /ratings/*` | Star rating (see `src/modules/extraRating.ts`). `POST` is an upsert, not insert-once |
| `DELETE /visitor` | Erases the caller's comment, rating, unlock and identity cookie — the "DELETE DATA" button |
| `GET /admin/comments/*` | Moderation; requires the `X-Admin-Key` header |
| `/unlock-hub` | SignalR hub the desktop subscribes to while showing its QR |
| `POST /unlock/{sessionId}` | Called by the phone that scanned the QR; pushes `unlocked` + a claim token to that session |
| `POST /unlock/claim` | Called by the **desktop** to redeem that token and persist the unlock against its own identity |

### Who the visitor is

`POST /visitor/session` takes `{ fingerprint, coarseFingerprint }` and returns
`{ visitorId, comment, rating, isUnlocked }` — one answer, so the guestbook, the rating and the
unlock can never disagree. It also issues or re-issues the identity cookie, which puts every later
request on the exact-match path. The frontend fires it from the EXPLORE press
(`Misc/Start-Transition.vue`), using the intro choreography as cover.

Identity resolves in three layers (`api/VisitorResolver.cs`), in order:

1. the `visitorId` cookie — exact, same browser;
2. the strict fingerprint hash — same browser after a data wipe;
3. the coarse fingerprint hash **together with** the IP hash — the cross-browser case.

Layer 3 is deliberately weak and never matches alone: two identically specced machines on one
network resolve to each other, and a new DHCP lease drops the visitor back to a rescan. Both are
acceptable — the prize is a portfolio section. Where identity resolves only through layer 3, the
session withholds the stored comment and returns `null`, so the form starts empty rather than
pre-filling what might be someone else's name and message.

### Classified-section unlock flow

1. The desktop mints a 32-hex-char session id client-side, connects to `/unlock-hub`, and calls
   `Subscribe(sessionId)` — which is what registers the session server-side, so an id nobody is
   listening on can never be claimed.
2. It renders a QR for `<site-url>?unlock=<sessionId>` (`qrcode`, generated in the browser).
3. The phone opens that URL, `Unlock-Scan-Splash.vue` sees the query param and `POST`s to
   `/unlock/{sessionId}`.
4. The endpoint claims the session — **single-use, 15-minute TTL** — mints a one-time **claim
   token** and broadcasts `unlocked` *with that token* to the session's group. Expired, replayed
   and guessed ids all get an identical `404`.
5. The desktop receives the push and calls `POST /unlock/claim` with the token and its **own**
   fingerprints and cookie. The server burns the token and writes the `VisitorUnlock` row. This
   split is the whole point: the phone did the scanning, but the unlock belongs to the big screen,
   and persisting it on step 4 would store the phone's identity. Without the token the endpoint
   would be a free "unlock me" for anyone who found the route — the token authorizes the write,
   not the cookie.
6. The desktop shows the popup; confirming it activates the section in the registry, which is what
   mounts the new nav entry and slides it in from off the right edge.

`localStorage` still holds the unlock, but only as a synchronous cache so the section never
flashes locked on load; `POST /visitor/session` overwrites it with the server's answer.

Because a session is single-use, re-testing the scan means becoming a new visitor. The
classified section's **DELETE DATA** button does that in one click: `DELETE /visitor` drops the
comment, the rating **and the unlock row**, expires the identity cookie, clears local storage and
reloads locked again. Dropping the unlock row is what makes the retest possible at all — without
it the server would immediately re-unlock on the next lookup. It doubles as a genuine "erase me"
control for visitors.

The desktop rotates its session every 14 minutes so the QR on screen is never past its TTL.
Sessions and claim tokens live in per-replica memory (hence the single-replica rule); only the
resulting `VisitorUnlock` row reaches the database.

Rate limit on `POST /unlock/*` and `/visitor/*` is 20 per IP per 10 minutes; `POST /ratings` is
also 20 per 10 minutes (looser than comments, because changing your mind is legitimate).

## Known limitations

- **Safari users cannot edit or delete their own comment.** The `visitorId` cookie is third-party
  (site on `vaditim.github.io`, API on `azurecontainerapps.io`) and Safari blocks those outright.
  Posting still works for everyone — duplicate prevention falls back to the fingerprint and IP-hash
  layers, which don't depend on the cookie. The only clean fix is a custom domain with the API on a
  subdomain of the site.
- **First request after idle is slow.** The serverless SQL tier auto-pauses; the retry policy in
  `Program.cs` covers the wake-up (error 40613) but the request can take several seconds.
- **Rate limits are per-IP and in-memory.** 3 posts / 10 min, 60 reads / min. They reset whenever a
  revision restarts.
