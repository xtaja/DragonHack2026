# FoodSwipe — Implementation Plan

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (already set up) |
| Styling | Tailwind CSS + Framer Motion (swipe animations) |
| Backend | Node.js + Express |
| Real-time | Socket.io (multiplayer rooms) |
| Food Data | TheMealDB API (free, no key needed) + Spoonacular (backup) |
| Deployment | DigitalOcean App Platform |
| State | Zustand (lightweight, simple) |

---

## Project Structure

```
DragonHack2026/
├── dragonhack26-app/          # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeCard.jsx          # Food card with swipe gesture
│   │   │   ├── SwipeStack.jsx         # Stack of swipeable cards
│   │   │   ├── FoodDetail.jsx         # Expanded food info (swipe up)
│   │   │   ├── MatchScreen.jsx        # Match found overlay
│   │   │   ├── RoomCode.jsx           # Display/copy room code
│   │   │   └── PreferenceChip.jsx     # Tag chip for preferences/restrictions
│   │   ├── pages/
│   │   │   ├── SetupPage.jsx          # Screen 1: username + preferences
│   │   │   ├── ModePage.jsx           # Single / Multiplayer choice
│   │   │   ├── SwipePage.jsx          # Screen 2: singleplayer swipe
│   │   │   ├── CreateRoomPage.jsx     # Multiplayer: create room + show code
│   │   │   ├── JoinRoomPage.jsx       # Multiplayer: enter room code
│   │   │   ├── MultiSwipePage.jsx     # Multiplayer swipe (synced)
│   │   │   └── ResultPage.jsx         # Recipe link / food provider
│   │   ├── store/
│   │   │   └── useAppStore.js         # Zustand global state
│   │   ├── hooks/
│   │   │   ├── useFoodData.js         # Fetch + filter food from API
│   │   │   └── useSocket.js           # Socket.io connection hook
│   │   ├── lib/
│   │   │   ├── api.js                 # TheMealDB API calls
│   │   │   ├── socket.js              # Socket.io client instance
│   │   │   └── filters.js             # Apply user preferences/restrictions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── routes/
│   │   │   ├── food.js                # Food fetch + filter endpoint
│   │   │   └── rooms.js               # REST: create/get room info
│   │   ├── socket/
│   │   │   └── roomHandler.js         # Socket.io room logic + match detection
│   │   ├── services/
│   │   │   ├── foodService.js         # TheMealDB fetch, caching, filtering
│   │   │   └── roomService.js         # In-memory room state management
│   │   ├── utils/
│   │   │   └── codeGen.js             # Generate 6-char room codes
│   │   └── index.js                   # Express + Socket.io entry point
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml         # Local dev: frontend + backend together
├── .do/
│   └── app.yaml               # DigitalOcean App Platform spec
└── PLAN.md                    # This file
```

---

## Team Division

### Member 1 — Frontend & UX
**Owns:** All pages, swipe animations, UI components, routing

**Tasks:**
1. Install dependencies: `tailwindcss`, `framer-motion`, `zustand`, `react-router-dom`, `socket.io-client`
2. Build `SetupPage` — username input, preference chips, restriction chips, dislike tags
3. Build `ModePage` — single/multiplayer choice buttons
4. Build `SwipePage` — card stack with left/right/up swipe (Framer Motion drag)
5. Build `FoodDetail` — slide-up panel with ingredients, area, tags
6. Build `MatchScreen` / `ResultPage` — recipe link display with confetti
7. Build `CreateRoomPage` — show generated code, copy button, share link
8. Build `JoinRoomPage` — code input, join button
9. Build `MultiSwipePage` — same as SwipePage but emits socket events
10. Wire up Zustand store for user session + current food list

### Member 2 — Backend & Real-time
**Owns:** Express API, Socket.io room logic, food filtering

**Tasks:**
1. Init Node.js project, install: `express`, `socket.io`, `cors`, `node-fetch`, `dotenv`
2. Build `foodService.js` — fetch meals from TheMealDB by category, cache results
3. Build `filters.js` logic — filter by preference tags, exclude restriction ingredients, exclude disliked ingredients
4. Build `POST /api/rooms` — generate room code, store room state in memory (Map)
5. Build `GET /api/rooms/:code` — return room info + member list
6. Build Socket.io `roomHandler.js`:
   - `join-room` event — add player to room, broadcast member list
   - `swipe` event — record player's swipe on a food item
   - Match detection — when all players swipe right on same food → emit `match-found`
   - `start-game` event — distribute shuffled food list to all players in room
7. Build `GET /api/food` — accepts query params for preferences/restrictions, returns filtered food array

### Member 3 — Food Data, Integration & Deployment
**Owns:** TheMealDB data layer, frontend↔backend wiring, DigitalOcean deploy

**Tasks:**
1. Map TheMealDB categories to app preference tags:
   - Sweet → Dessert, Pasta
   - Savory → Beef, Chicken, Seafood, Side, Starter
   - Breakfast → Breakfast
   - Healthy → Vegetarian, Vegan
   - Asian → Japanese, Chinese, Thai, Indian
2. Build ingredient→restriction exclusion map:
   - Vegan: exclude meat/dairy ingredients
   - Nut allergy: exclude nuts
   - Gluten-free: exclude wheat/flour
3. Write `useFoodData.js` hook — calls backend `/api/food`, returns paginated list
4. Write `useSocket.js` hook — connects to backend Socket.io, exposes `joinRoom`, `swipe`, `startGame`, listens for `match-found`
5. Wire up all pages to Zustand store and hooks (integration with Member 1 & 2)
6. Write `docker-compose.yml` for local dev
7. Write `.do/app.yaml` for DigitalOcean App Platform (two services: frontend static + backend web)
8. Set up DigitalOcean deployment, configure env vars, test end-to-end

---

## Screen Flow

```
SetupPage
    ↓
ModePage
   ├── Singleplayer → SwipePage → [Like] → ResultPage
   └── Multiplayer
         ├── Create Room → CreateRoomPage (show code) → [Start] → MultiSwipePage → [Match] → ResultPage
         └── Join Room  → JoinRoomPage (enter code)  → [Join]  → MultiSwipePage → [Match] → ResultPage
```

---

## Key Implementation Details

### Swipe Mechanics (Framer Motion)
```jsx
// SwipeCard.jsx — drag thresholds
const SWIPE_RIGHT_THRESHOLD = 100;   // like
const SWIPE_LEFT_THRESHOLD = -100;   // dislike / skip
const SWIPE_UP_THRESHOLD = -80;      // show detail panel

<motion.div
  drag
  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
  onDragEnd={(e, { offset }) => {
    if (offset.x > SWIPE_RIGHT_THRESHOLD) onLike();
    else if (offset.x < SWIPE_LEFT_THRESHOLD) onSkip();
    else if (offset.y < SWIPE_UP_THRESHOLD) onDetail();
  }}
/>
```

### Room Code Generation
```js
// backend/src/utils/codeGen.js
const generate = () => Math.random().toString(36).slice(2, 8).toUpperCase();
// Example: "K4T2WX"
```

### Match Detection Logic
```js
// roomHandler.js
// rooms: Map<code, { members: [], swipes: Map<foodId, Set<userId>> }>
socket.on('swipe-right', ({ roomCode, foodId, userId }) => {
  const room = rooms.get(roomCode);
  if (!room.swipes.has(foodId)) room.swipes.set(foodId, new Set());
  room.swipes.get(foodId).add(userId);
  if (room.swipes.get(foodId).size === room.members.length) {
    io.to(roomCode).emit('match-found', { foodId });
  }
});
```

### TheMealDB API Calls
```js
// No API key needed for free tier
const BASE = 'https://www.themealdb.com/api/json/v1/1';
fetch(`${BASE}/filter.php?c=Seafood`)   // by category
fetch(`${BASE}/lookup.php?i=52772`)     // full meal detail (ingredients, recipe)
fetch(`${BASE}/search.php?s=`)          // all meals (paginated manually)
```

### Food Card Data Model
```js
{
  id: '52772',
  name: 'Teriyaki Chicken Casserole',
  category: 'Chicken',
  area: 'Japanese',
  image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  tags: ['Asian', 'Savory'],
  ingredients: ['chicken', 'soy sauce', 'garlic', ...],
  recipeUrl: 'https://www.youtube.com/...',   // strYoutube from API
  sourceUrl: 'https://...',                    // strSource from API
}
```

---

## DigitalOcean Deployment

### `.do/app.yaml`
```yaml
name: foodswipe
services:
  - name: backend
    source_dir: /backend
    github:
      repo: your-org/dragonhack2026
      branch: main
    run_command: node src/index.js
    environment_slug: node-js
    instance_size_slug: basic-xxs
    envs:
      - key: PORT
        value: "8080"
      - key: FRONTEND_URL
        value: ${APP_URL}

  - name: frontend
    source_dir: /dragonhack26-app
    github:
      repo: your-org/dragonhack2026
      branch: main
    build_command: npm run build
    environment_slug: node-js
    output_dir: dist
    envs:
      - key: VITE_API_URL
        value: ${backend.PUBLIC_URL}
      - key: VITE_SOCKET_URL
        value: ${backend.PUBLIC_URL}
```

**Estimated deploy time:** ~5 minutes after first push. Free tier ($5/mo for basic backend + free static frontend hosting on App Platform).

---

## Day-of Hackathon Timeline

| Time | Milestone |
|---|---|
| 0:00 | Repo setup, install all deps, confirm local dev runs |
| 1:00 | SetupPage + ModePage done, food API returning data |
| 2:30 | SwipePage working with real food cards + swipe gestures |
| 3:30 | Backend rooms + Socket.io working, CreateRoom + JoinRoom pages done |
| 4:30 | MultiSwipePage + match detection working end-to-end |
| 5:00 | ResultPage with recipe link, polish animations |
| 5:30 | Deploy to DigitalOcean, test on phones |
| 6:00 | Buffer for bugs + demo prep |

---

## Quick Start

```bash
# Terminal 1 — Frontend
cd dragonhack26-app
npm install
npm run dev

# Terminal 2 — Backend
cd backend
npm install
node src/index.js

# Or with Docker
docker-compose up
```
