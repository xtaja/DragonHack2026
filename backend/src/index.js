import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { setupRoomHandler } from './roomHandler.js'

const app = express()
const httpServer = createServer(app)

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] },
})

app.use(cors({ origin: FRONTEND_URL }))
app.get('/health', (_, res) => res.json({ ok: true }))

setupRoomHandler(io)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Backend running on :${PORT}`))
