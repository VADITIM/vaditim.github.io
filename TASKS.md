# Tasks & Known Issues

Migrated from `src/CLAUDE.md`. This file is not auto-loaded by Claude — point Claude at it when working on one of these.

## Future Tasks

### Comments Section (backed by a database)

**Progress (2026-07-21):** Backend built in `api/` (ASP.NET Core Minimal API, .NET 8, EF Core with SQLite for dev / SQL Server for hosted, selected via `DbProvider` config). All acceptance rules, rate limiting, admin endpoints (`X-Admin-Key` header), and the by-IP correlation view implemented. Frontend wired: `src/modules/extraComments.ts` (fingerprint + API client) and live comments UI in Extra-Section. API base URL comes from `VITE_COMMENTS_API_URL` (defaults to `http://localhost:5282`).

**Database provisioned (2026-07-21):** Azure SQL Database `portfolio` on logical server `vaditim-portfolio.database.windows.net` (resource group `portfolio-rg`, West Europe, **free offer** — 32 GB storage + 100k vCore-seconds/month, serverless General Purpose, auto-pauses when idle, overage billing disabled). SQL authentication; firewall allows Azure services + the dev machine's IP. Postgres/Neon is no longer a candidate — the Npgsql provider was removed.

Verified end-to-end against the live Azure database: schema auto-created, all four acceptance-rule cases (clean accept / cookie duplicate / fingerprint duplicate / same-IP-different-fingerprint flagging), rate limiting (429 after 3 posts), admin auth (401 without key), hide, and delete. Test rows removed afterwards; table is empty.

Because the serverless tier auto-pauses, `UseSqlServer` sets `EnableRetryOnFailure` — the first request after an idle period fails with error 40613 while the database wakes. Do not remove it.

**Local config:** connection string lives in .NET user secrets (`ConnectionStrings:CommentsDb`), never in the repo. Run against Azure with `DbProvider=SqlServer dotnet run`; omit it to use local SQLite. Note `Properties/launchSettings.json` overrides `ASPNETCORE_URLS`, so `dotnet run` listens on 5282 regardless of that variable.

**Remaining:** API hosting (App Service still blocked on the compute quota below), production secrets (`IpHashSalt`, `AdminApiKey`), CORS `FrontendOrigin` for the gh-pages origin, and the two open decisions below. Flagged comments currently start **visible** (`IsHidden: false`) — provisional, pending the decision below.

Build a comments feature backed by a database so visitors can leave a message that persists and is shown to future visitors. **One comment per visitor, no real authentication** — enforced by layering several weak identity signals instead of one strong one, sized for a small portfolio (deter casual double-posting, flag the determined cases for manual review; not social-media-grade security).

**Backend: ASP.NET Core Minimal API** (shared host with the Classified Section unlock — see that task).

**Identity layers (defense in depth, each cheap to bypass alone):**

1. **Cookie (primary):** on first comment `POST`, the server issues a `visitorId` (random GUID) as an `HttpOnly`, `Secure`, `SameSite=None` persistent cookie (~1 year). The comment row stores this ID. Strongest ownership signal — also what authorizes edit/delete later.
2. **Browser fingerprint (secondary):** client computes a fingerprint hash (canvas/WebGL renderer string, screen metrics, timezone, language, hardware concurrency — a small hand-rolled hash is fine, no need for FingerprintJS Pro) and sends it with the request. Server stores `Sha256(fingerprint)`.
3. **IP address (corroborating, never blocking alone):** server captures the request IP and stores a **salted hash** only — the site has a German Impressum, so treat IP as personal data under GDPR; hashed IP is enough for correlation and avoids storing the raw address. Shared/NAT IPs mean IP alone must never reject a comment.

**Acceptance rule for `POST /comments`:**

- Cookie `visitorId` already owns a comment → **reject** (409, "you already have a comment").
- No cookie, but **fingerprint hash matches** an existing comment → **reject** (same browser, cleared cookies).
- Cookie and fingerprint both new, but **IP hash matches** an existing comment with a *different* fingerprint → **accept, but flag** (`FlagReason: SameIpDifferentFingerprint`). This is the VPN/incognito case: let it through, surface it for manual review.
- All three new → accept clean.

**Moderation (manual opt-out):**

- Comment row carries `IsFlagged`, `FlagReason`, `IsHidden`. Flagged comments still display publicly until acted on (or start hidden — decide during build).
- A minimal admin surface: `GET /admin/comments?flagged=true` and `PATCH /admin/comments/{id}` (hide/unhide/delete), protected by a single static admin API key from configuration — no auth system for one admin.
- Correlation view: list comments grouped by IP hash so same-IP-different-fingerprint clusters are visible at a glance.

**Rate limiting (anti-spam, not anti-adversary):**

- ASP.NET's built-in rate limiter middleware, partitioned by IP: strict on `POST /comments` (e.g. 3 attempts / 10 min), loose on reads. Tunable via configuration, no redeploy.
- Plus input guards before storage: max length (~280 chars), trim, HTML-escape on render (never render raw), optional basic profanity list.

**Edit/delete:** authorized by the `visitorId` cookie matching the comment row — no tokens to manage client-side. Losing the cookie loses edit/delete (acceptable; the fingerprint match will still block a duplicate from that browser).

**Likes:** any visitor can like a comment, keyed by their `visitorId` cookie (one like per visitor per comment; issue the cookie on first like if absent).

Sketch:

```csharp
app.MapPost("/comments", async (CommentInput input, HttpContext http, CommentsDb db) =>
{
    var visitorId = http.GetOrIssueVisitorCookie();
    var fingerprintHash = Sha256(input.Fingerprint);
    var ipHash = Sha256(http.Connection.RemoteIpAddress + salt);

    if (await db.Comments.AnyAsync(c => c.VisitorId == visitorId || c.FingerprintHash == fingerprintHash))
        return Results.Conflict("You've already posted a comment.");

    var sameIpOtherFingerprint = await db.Comments.AnyAsync(c => c.IpHash == ipHash && c.FingerprintHash != fingerprintHash);

    db.Comments.Add(new Comment
    {
        Text = input.Text.Trim(),
        VisitorId = visitorId,
        FingerprintHash = fingerprintHash,
        IpHash = ipHash,
        IsFlagged = sameIpOtherFingerprint,
        FlagReason = sameIpOtherFingerprint ? FlagReason.SameIpDifferentFingerprint : null,
        CreatedAt = DateTime.UtcNow,
    });
    await db.SaveChangesAsync();
    return Results.Created(...);
});
```

**Known accepted gaps** (fine for a portfolio): VPN + incognito + different machine posts twice (gets flagged only if IP repeats); two genuine visitors behind the same NAT with odd setups may get flagged (manual review resolves it); fingerprints drift with browser updates (worst case: a duplicate slips through and is visible to you anyway).

Open questions:
- Hosting: GitHub Pages can't run the API — host it separately (Azure App Service free tier, Fly.io, Render). **The database half is settled** (Azure SQL free offer, provisioned above); only the API host is still open. Cross-site cookies (gh-pages frontend → API domain) require `SameSite=None; Secure` and exact CORS origin configuration — verify early, it's the most likely integration headache.
- Whether flagged comments start hidden or visible.
- Admin surface: bare endpoints + REST client is enough, or a tiny hidden admin page.

### Classified Section — QR code unlock (realtime)

**Status: unlock mechanic implemented; nav/section-registration half still open.** Hosting is settled (Azure Container Apps, shared with the comments API — App Service was abandoned after the new-subscription VM quota block). The realtime channel is live: `UnlockHub` + `POST /unlock/{sessionId}` in `api/Unlock/`, client in `src/modules/classifiedUnlockSession.ts`, phone splash in `Unlock-Scan-Splash.vue`. Session flow, TTL, single-use claiming and the single-replica constraint are documented in [`api/DEPLOY.md`](api/DEPLOY.md).

**Still to do here:** step 5 below — the confirm button's leave animation, activating the section in the registry, and the nav label sliding in from the right with the list reflowing. `Classified-Unlock-Popup.vue` currently only shows the popup.

A hidden section unlocked by scanning a QR code displayed on the desktop page. The scan happens on the visitor's phone; the desktop page updates **live** — no refresh — via a realtime push from the backend. The payoff: the visitor scans, and the game menu grows a new entry in front of them.

**Backend: shared with the Comments Section.** Same host/API as the comments backend (candidate: ASP.NET Core Minimal API) — no second service. Separate concerns inside it: own endpoints and, if needed, its own table/store. Realtime channel via **SignalR** (native to ASP.NET Core; free tier of Azure SignalR if hosted serverless). No persistence strictly required — unlock sessions can live in memory/cache with a TTL — but a table works too if we want unlock stats.

**Flow:**

1. **Session setup (desktop):** on load, the client generates a random high-entropy session ID, connects to the realtime hub, and subscribes to a group keyed by that session ID. It renders a QR code encoding `https://<site>/?unlock=<sessionId>` (client-side QR generation, no API call needed for the image).
2. **Scan (phone):** the phone opens the URL; the page detects the `unlock` query param and calls `POST /unlock/{sessionId}` on the backend. The phone view shows a minimal confirmation splash (keep it trivial — mobile is frozen; no full experience needed).
3. **Push (backend):** the endpoint validates the session ID (exists, not expired, not already used) and broadcasts an `unlocked` event to that session's group.
4. **Unlock module (desktop):** on receiving the event, a new module pops up — `position: absolute`, centered on screen — reading **"Classified Section — UNLOCKED"** with a confirm button. Full enter animation (and matching leave, per animation rules).
5. **Confirm:** clicking the button dismisses the module (leave animation), then:
   - the classified section registers/activates in the section registry (resolved via `getSectionIndexById`, never a hardcoded index),
   - the nav updates itself: a new label display appends **at the bottom of the nav list** — the label **slides in from the right (from outside the screen)** and the nav **flexes to fit the new element** (the existing labels reflow as it lands).

**Client architecture notes:**

- The classified section component stays mounted like every other section (GSAP needs persistent DOM targets); "locked" is state, not absence. Locked sections are excluded from nav and scroll-intent cycling until unlocked.
- Unlock state persists in `localStorage` so a returning visitor keeps the section without rescanning.
- The unlock module is a standalone overlay component, not tied to any section's timeline — it can fire regardless of which section is currently active.
- QR code rendered client-side (small lib or hand-rolled); style it to match the game-menu aesthetic (section color, scanline/frame treatment).

**Backend/security notes:**

- Session IDs: high-entropy, short TTL (e.g. 15 min), single-use — prevents replaying someone else's unlock or unlocking strangers' sessions by guessing IDs.
- Rate-limit `POST /unlock/*` (cheap; no proof-of-work needed — worst case someone unlocks their own easter egg).
- If the realtime connection drops, resubscribe on reconnect with the same session ID; if the session expired, silently mint a new one and re-render the QR.
- Phone hitting a stale/used session ID gets a friendly "session expired — reload the page on the big screen" message.

**Open questions:**

- What lives *inside* the classified section (content TBD — this task covers the unlock mechanic).
- Whether unlock also triggers anything ambient (background shift, sound, nav glint) beyond the module + new entry.
- SignalR vs. plain WebSockets/SSE if the comments backend ends up not being ASP.NET.

### `prefers-reduced-motion` support

Site-wide reduced-motion mode, gated on the `prefers-reduced-motion: reduce` media query. When active:

- The section transitioner (the game-menu section enter/leave choreography driven by `sectionsStateMachine.ts`/`animationHandler.ts`) does **not** play — section switches happen without its slide/cover-slice motion.
- Every other animation across the site is reduced/skipped **except**:
  - The Perks Info Module animation (`Name.vue`'s typewriter reveal).
  - The Projects modules 1-3 enter and leave animation.

Needs a shared helper (e.g. a `prefersReducedMotion` ref/matchMedia listener in a misc module) that animation handlers can branch on, rather than each handler re-querying the media feature ad hoc. Ties into the existing "respect `prefers-reduced-motion`" accessibility guideline in `.claude/rules/frontend.md` — this task is the concrete implementation of that guideline.

### Perks Section overhaul — DONE

Implemented from the `Perks Section.dc.html` Claude Design prototype (project "Portfolio design system setup"). Superseded the original plan, which called for an Obsidian-style node graph with one Module-Display per perk in a vertical grid — the section now uses the **PERK-CRYSTAL** showpiece instead, and the perks carry **no module chrome** of their own.

Current shape:
- Left half: a canvas wireframe icosahedron (`miscPerkCrystalCanvas.ts`) — draggable via world-space quaternions like the Logs cubes, with a glowing nucleus, orbiting spark ring, and a counter-rotating inner shell. Deliberately a gem, not a box, so it reads as a sibling of the Logs cubes rather than a copy.
- Category headlines (C# / WEB / UI/UX) sit beneath it as bare underlined text. Selecting one recolours the crystal and unfolds that category's skills as satellite nodes tethered to the nearest shell vertex; clicking a node opens the shared detail panel below.
- Right half: the name block (`Name.vue`), unchanged.

Remaining follow-ups:
- The prototype also carried `particles` (a V-monogram particle field) and `hologram` (a 9-axis stat radar) showpiece variants behind a design-time switcher. Only `core` — the crystal — was ported; the other two are still available in the design project if we ever want to swap.
- Nothing responsive below `smallDesktop`: the crystal stage is a fixed 430×430 / canvas 380×330, in line with the frozen-mobile rule.

## Current Ideas

- **Projects section:** when switching projects, the helix should ripple itself from a random position on its strand in all directions.
- **Landing section:** keypress listener for "S" — pressed twice, the whole Loading section is skipped: only its leave animation plays; all timelines stop wherever they are. (Debugging aid.)

## Known Issues

- Projects section: Module-Displays in Module-Display-Projects are not parallax.
- Projects section: Module-Display border hover should be the section main color.
- Projects section: Project-Name in Module-Display-Project-Info doesn't properly play its leave animation before showing new content. Uncouple Module-Display-Projects animation from Project-Name leave animation — two separate animations handling their data differently. Project-Name always plays its leave animation before showing new content, no matter how fast projects are cycled; before playing enter, check the current project and use its data (don't queue animations).
- Landing page & Section-Cover-Slices should not use border-radius.
- Landing page: "Greetings User" shows first, stays 1s, plays its leave animation; wait 0.35s, then "Explore your experience" plays and stays 1s. Both labels share the same position (cycled). Then proceed with the normal timeline.



## Code Inconsistencies
Scan the entire codebase and replace all abbreviations with full names.