import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

// Singleton — shared across all pages, connect/disconnect manually
export const socket = io(SOCKET_URL, { autoConnect: false })
