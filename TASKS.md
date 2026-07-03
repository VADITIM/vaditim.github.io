# Tasks & Known Issues

Migrated from `src/CLAUDE.md`. This file is not auto-loaded by Claude — point Claude at it when working on one of these.

## Future Tasks

### Comments Section (backed by a database)

Build a comments feature backed by a database so visitors can leave a message that persists and is shown to future visitors.

- **Storage:** a database holding each comment with its text, timestamp, an owner token hash, and a like count.
- **Visitor identity — crypto token / proof-of-work, not IP.** IP-based identity was rejected (shared/NAT'd IPs, VPNs, changing IPs make it leaky and unreliable). Instead, a web3-style local identity:
  - On first visit the client generates a keypair (or random high-entropy secret) entirely client-side, stored in `localStorage`. This is the visitor's **owner token** — nothing server-generated, nothing tied to IP.
  - Before a comment is accepted, the client completes a small **proof-of-work** challenge (server sends nonce/difficulty; client hashes `token + nonce + text` until the hash meets the target). This replaces IP rate-limiting as the anti-spam gate.
  - The server stores only a **hash of the owner token** against the comment row. One comment per identity: reject if that token hash already owns one.
  - **Edit/delete:** client resends the token; server re-hashes and compares before allowing `PATCH`/`DELETE`. Losing `localStorage` means losing edit/delete (acceptable trade-off, no accounts).
- **Likes:** any visitor can like a comment, keyed by their own owner token (one like per visitor per comment). Likes don't require proof-of-work — only creation does.
- **Display:** a later-built Comments section renders stored comments, like counts, and edit/delete controls (shown only when the local token matches the stored hash).

Open questions:
- Needs a backend/API (currently a static SPA on GitHub Pages) — hosted DB + serverless endpoint.
- Abuse protection before display: length limits, sanitization/escaping, profanity/spam filtering, in addition to proof-of-work.
- Proof-of-work difficulty tunable server-side, no client redeploy.

**Candidate backend: ASP.NET Core Minimal API.** A handful of endpoints; store only `Sha256(ownerToken)`; verify ownership by re-hashing tokens sent with edit/delete/like. Sketch:

```csharp
app.MapPost("/comments", async (CommentInput input, CommentsDb db) =>
{
    if (!ProofOfWork.Verify(input.Token, input.Nonce, input.Text, difficulty: 20))
        return Results.BadRequest("Invalid proof of work.");
    var tokenHash = Sha256(input.Token);
    if (await db.Comments.AnyAsync(c => c.OwnerTokenHash == tokenHash))
        return Results.Conflict("You've already posted a comment.");
    db.Comments.Add(new Comment { Text = input.Text.Trim(), OwnerTokenHash = tokenHash, CreatedAt = DateTime.UtcNow });
    await db.SaveChangesAsync();
    return Results.Created(...);
});

app.MapDelete("/comments/{id}", async (Guid id, string token, CommentsDb db) =>
{
    var comment = await db.Comments.FindAsync(id);
    if (comment is null || comment.OwnerTokenHash != Sha256(token)) return Results.Forbid();
    db.Comments.Remove(comment);
    await db.SaveChangesAsync();
    return Results.NoContent();
});
```

Hosting caveat: GitHub Pages can't run the API — host it separately (Azure App Service free tier, Azure Container Apps, Fly.io, Render) with a hosted DB (Azure SQL free tier, or Postgres on Neon/Supabase); local SQLite resets on ephemeral filesystems. Trade-off: Minimal API is right if C# is preferred; a serverless function or BaaS (Supabase/Firebase) is less infrastructure, though PoW verification must live server-side either way.

### Secret Section — QR code unlock (realtime)

A hidden section unlocked by scanning a QR code displayed on the desktop page. The scan happens on the visitor's phone; the desktop page updates **live** — no refresh — via a realtime push from the backend. The payoff: the visitor scans, and the game menu grows a new entry in front of them.

**Backend: shared with the Comments Section.** Same host/API as the comments backend (candidate: ASP.NET Core Minimal API) — no second service. Separate concerns inside it: own endpoints and, if needed, its own table/store. Realtime channel via **SignalR** (native to ASP.NET Core; free tier of Azure SignalR if hosted serverless). No persistence strictly required — unlock sessions can live in memory/cache with a TTL — but a table works too if we want unlock stats.

**Flow:**

1. **Session setup (desktop):** on load, the client generates a random high-entropy session ID, connects to the realtime hub, and subscribes to a group keyed by that session ID. It renders a QR code encoding `https://<site>/?unlock=<sessionId>` (client-side QR generation, no API call needed for the image).
2. **Scan (phone):** the phone opens the URL; the page detects the `unlock` query param and calls `POST /unlock/{sessionId}` on the backend. The phone view shows a minimal confirmation splash (keep it trivial — mobile is frozen; no full experience needed).
3. **Push (backend):** the endpoint validates the session ID (exists, not expired, not already used) and broadcasts an `unlocked` event to that session's group.
4. **Unlock module (desktop):** on receiving the event, a new module pops up — `position: absolute`, centered on screen — reading **"Secret Section — UNLOCKED"** with a confirm button. Full enter animation (and matching leave, per animation rules).
5. **Confirm:** clicking the button dismisses the module (leave animation), then:
   - the secret section registers/activates in the section registry (resolved via `getSectionIndexById`, never a hardcoded index),
   - the nav updates itself: a new label display appends **at the bottom of the nav list** — the label **slides in from the right (from outside the screen)** and the nav **flexes to fit the new element** (the existing labels reflow as it lands).

**Client architecture notes:**

- The secret section component stays mounted like every other section (GSAP needs persistent DOM targets); "locked" is state, not absence. Locked sections are excluded from nav and scroll-intent cycling until unlocked.
- Unlock state persists in `localStorage` so a returning visitor keeps the section without rescanning.
- The unlock module is a standalone overlay component, not tied to any section's timeline — it can fire regardless of which section is currently active.
- QR code rendered client-side (small lib or hand-rolled); style it to match the game-menu aesthetic (section color, scanline/frame treatment).

**Backend/security notes:**

- Session IDs: high-entropy, short TTL (e.g. 15 min), single-use — prevents replaying someone else's unlock or unlocking strangers' sessions by guessing IDs.
- Rate-limit `POST /unlock/*` (cheap; no proof-of-work needed — worst case someone unlocks their own easter egg).
- If the realtime connection drops, resubscribe on reconnect with the same session ID; if the session expired, silently mint a new one and re-render the QR.
- Phone hitting a stale/used session ID gets a friendly "session expired — reload the page on the big screen" message.

**Open questions:**

- What lives *inside* the secret section (content TBD — this task covers the unlock mechanic).
- Whether unlock also triggers anything ambient (background shift, sound, nav glint) beyond the module + new entry.
- SignalR vs. plain WebSockets/SSE if the comments backend ends up not being ASP.NET.

### Perks Section overhaul

Interactive node graph on the left (like Obsidian's graph view). Each main perk is clickable and reveals its children as new nodes. Each perk gets its own Module-Display. Module-Displays aligned in a vertical grid, dynamic scaling.

Perk changes:
- C# Developer → **C#** (C#-related skills)
- Vue & Typescript → **Web** (Vue, Angular, Typescript, mySQL)
- UI/UX Animator → **UI/UX**
- Game Designer → REMOVE
- Technical Designer → REMOVE

Name-Display replaced by Name: "vadim niedental" becomes **VADITIM**, with "vadim niedental" as a small suffix/notice underneath. Enter/leave animations overhauled. Both names get a typewriter animation — built as a standalone API like Label-Set (configurable delays, speed, etc.). The typewriter caret bar uses the section main color, same as the text. Labels should be real 3D (the old setup overlaps multiple copies and borders — replace with actual 3D).

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