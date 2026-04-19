# FoodSwipe 🍽️

Tinder for food. Swipe through dishes until you find what you want to eat — solo or with friends.

---

## First-time setup

Clone the repo, then install dependencies for both sub-projects:

```bash
cd backend && npm install
cd ../dragonhack26-app && npm install
```

> Node.js 18+ required.

---

## Running locally

### Option A — PowerShell scripts (Windows, recommended)

**Local only:**
```powershell
.\start-local.ps1
```

---

### Option B — npm (single terminal, cross-platform)
Run in both directories, backend and dragonhack26-app

**Local only:**
```bash
npm run dev
```

> For LAN mode, also create `dragonhack26-app/.env.local` with:
> ```
> VITE_SOCKET_URL=http://<your-local-ip>:3001
> ```
> Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux) — look for the IPv4 address under Wi-Fi.

---

### Running servers separately (manual)

```bash
# Terminal 1 — backend (port 3001)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd dragonhack26-app && npm run dev
```

---

## How it works

1. Enter your name and optional preferences / dietary restrictions
2. Choose **Solo** or **Multiplayer**
3. **Solo** — swipe right to like, left to skip, up (or ℹ) for details. Hit ❤️ to get the recipe link
4. **Multiplayer** — create a room and share the code or QR code. Everyone swipes the same food selection. When all players swipe right on the same dish it's a match 🎉. If no match is found, a leaderboard shows the most-liked dishes.

### Keyboard shortcuts (swipe screen)
| Key | Action |
|-----|--------|
| `→` or `L` | Like |
| `←` or `H` | Skip |
| `↑` or `K` | Details |
| `Esc` | Close details |

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Animations | Framer Motion |
| State | Zustand |
| Routing | React Router |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Food data | [TheMealDB](https://www.themealdb.com) (free, no API key) |
| Restaurant search | OpenStreetMap Overpass / Google Maps |
