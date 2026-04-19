# Tindish 🍽️

Tinder for food. Swipe through dishes until you find what you want to eat — solo or with friends.
Hosted on https://tindish.onrender.com/

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

