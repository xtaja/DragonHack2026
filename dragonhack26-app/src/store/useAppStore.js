import { create } from 'zustand'

const useAppStore = create((set) => ({
  // ── Setup ──────────────────────────────────────
  username: '',
  preferences: [],
  restrictions: [],
  dislikes: [],

  setUsername: (username) => set({ username }),
  togglePreference: (tag) =>
    set((s) => ({
      preferences: s.preferences.includes(tag)
        ? s.preferences.filter((t) => t !== tag)
        : [...s.preferences, tag],
    })),
  toggleRestriction: (tag) =>
    set((s) => ({
      restrictions: s.restrictions.includes(tag)
        ? s.restrictions.filter((t) => t !== tag)
        : [...s.restrictions, tag],
    })),
  addDislike: (item) =>
    set((s) => ({
      dislikes: s.dislikes.includes(item) ? s.dislikes : [...s.dislikes, item],
    })),
  removeDislike: (item) =>
    set((s) => ({ dislikes: s.dislikes.filter((d) => d !== item) })),

  // ── Result ─────────────────────────────────────
  likedFood: null,
  setLikedFood: (food) => set({ likedFood: food }),

  // ── Multiplayer ────────────────────────────────
  roomCode: null,
  isHost: false,
  roomMembers: [],
  multiplayerFoods: [],

  setRoom: (roomCode, isHost) => set({ roomCode, isHost }),
  setRoomMembers: (roomMembers) => set({ roomMembers }),
  setMultiplayerFoods: (multiplayerFoods) => set({ multiplayerFoods }),
  clearRoom: () => set({ roomCode: null, isHost: false, roomMembers: [], multiplayerFoods: [] }),
}))

export default useAppStore
