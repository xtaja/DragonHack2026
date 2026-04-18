# FoodSwipe 🍽️

Tinder for food. Swipe through dishes until you find what you want to eat — solo or with friends.

## Quick Start

### Option A — PowerShell scripts (recommended)

**Local only:**
```powershell
.\start-local.ps1
```

**Shared on a hotspot (LAN):**
```powershell
.\start.ps1
```
Opens two PowerShell windows (backend + frontend). The network script auto-detects your IP and prints the URL to share.

> If you get a security error, run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

---

### Option B — npm (single terminal)

**Local only:**
```bash
npm run dev
```

**Shared on a hotspot (LAN):**
```bash
npm run dev:host
```
> For LAN mode also set your IP in `dragonhack26-app/.env.local`:
> ```
> VITE_SOCKET_URL=http://<your-ip>:3001
> ```
> Find your IP with `ipconfig` (look for IPv4 under Wi-Fi).

---

## Manual setup

### Prerequisites
- Node.js 18+
- Install dependencies in both sub-projects:

```bash
cd backend && npm install
cd ../dragonhack26-app && npm install
```

### Running servers separately

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
4. **Multiplayer** — create a room and share the code, or join with a code. Everyone swipes the same food. When all players swipe right on the same dish it's a match 🎉

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
