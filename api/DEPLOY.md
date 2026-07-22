# Comments API — deploy

The API lives in `api/` (ASP.NET Core 8 Minimal API). It is built into a container image by
GitHub Actions and run on Azure Container Apps. Nothing is built on your machine — you never
need Docker locally.

## How a deploy happens

1. You push to `dev` with a change under `api/**`.
2. [`.github/workflows/api-image.yml`](../.github/workflows/api-image.yml) builds `api/Dockerfile`
   on GitHub's runners and pushes `ghcr.io/vaditim/portfolio-api:latest` (plus a `sha-<commit>` tag).
3. Azure Container Apps pulls the new `latest` and restarts the revision.

That's it — `git push` is the whole deploy command:

```sh
git push origin dev
```

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
- Image and tag: `vaditim/portfolio-api:latest`
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

The schema is created on startup via `EnsureCreated()` — there is no migration step.

### 4. Rebuild the frontend against the live API

`src/modules/extraComments.ts` reads `VITE_COMMENTS_API_URL` and defaults to `http://localhost:5282`.
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
