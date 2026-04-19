// rooms: Map<code, { code, host, members, foods, swipes, donePlayers, status }>
const rooms = new Map()

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function memberList(room) {
  return [...room.members.values()].map(m => ({
    username: m.username,
    preferences: m.preferences,
    restrictions: m.restrictions,
    dislikes: m.dislikes,
  }))
}

function buildScores(room) {
  return [...room.swipes.entries()]
    .map(([foodId, voters]) => ({ foodId, count: voters.size }))
    .sort((a, b) => b.count - a.count)
}

function checkGameOver(io, roomCode, room) {
  if (room.donePlayers.size >= room.members.size) {
    room.status = 'finished'
    io.to(roomCode).emit('game-over', { scores: buildScores(room) })
  }
}

export function setupRoomHandler(io) {
  io.on('connection', (socket) => {

    socket.on('create-room', ({ username, preferences = [], restrictions = [], dislikes = [] }) => {
      const code = generateCode()
      rooms.set(code, {
        code,
        host: socket.id,
        members: new Map([[socket.id, { username, preferences, restrictions, dislikes }]]),
        foods: null,
        swipes: new Map(),
        donePlayers: new Set(),
        status: 'waiting',
      })
      socket.join(code)
      socket.emit('room-created', { code, members: memberList(rooms.get(code)), isHost: true })
    })

    socket.on('join-room', ({ roomCode, username, preferences = [], restrictions = [], dislikes = [] }) => {
      const room = rooms.get(roomCode)
      if (!room) { socket.emit('room-error', { message: 'Room not found.' }); return }
      if (room.status !== 'waiting') { socket.emit('room-error', { message: 'Game already started.' }); return }

      const taken = [...room.members.values()].some(
        m => m.username.trim().toLowerCase() === username.trim().toLowerCase()
      )
      if (taken) {
        console.log(`[room ${roomCode}] Rejected duplicate username: "${username}"`)
        socket.emit('room-error', { message: `Username "${username}" is already taken. Please go back and choose a different name.` })
        return
      }

      room.members.set(socket.id, { username, preferences, restrictions, dislikes })
      socket.join(roomCode)
      const members = memberList(room)
      socket.emit('room-joined', { code: roomCode, members, isHost: false })
      socket.to(roomCode).emit('member-joined', { username, members })
    })

    socket.on('start-game', ({ roomCode, foods }) => {
      const room = rooms.get(roomCode)
      if (!room || room.host !== socket.id) return
      room.foods = foods.slice(0, 30)
      room.swipes = new Map()
      room.donePlayers = new Set()
      room.status = 'playing'
      io.to(roomCode).emit('game-started', { foods: room.foods })
    })

    socket.on('swipe-right', ({ roomCode, foodId }) => {
      const room = rooms.get(roomCode)
      if (!room || room.status !== 'playing') return
      if (!room.swipes.has(foodId)) room.swipes.set(foodId, new Set())
      room.swipes.get(foodId).add(socket.id)
      if (room.swipes.get(foodId).size === room.members.size) {
        room.status = 'matched'
        io.to(roomCode).emit('match-found', { foodId })
      }
    })

    socket.on('player-done', ({ roomCode }) => {
      const room = rooms.get(roomCode)
      if (!room || room.status !== 'playing') return
      room.donePlayers.add(socket.id)
      console.log(`[room ${roomCode}] Player done: ${room.donePlayers.size}/${room.members.size}`)
      checkGameOver(io, roomCode, room)
    })

    socket.on('disconnecting', () => {
      for (const [code, room] of rooms) {
        if (!room.members.has(socket.id)) continue
        const { username } = room.members.get(socket.id)
        room.members.delete(socket.id)
        room.donePlayers.delete(socket.id)
        if (room.members.size === 0) {
          rooms.delete(code); break
        }
        if (room.host === socket.id) {
          room.host = [...room.members.keys()][0]
        }
        const members = memberList(room)
        io.to(code).emit('member-left', { username, members })
        // Check if remaining players are all done after disconnect
        if (room.status === 'playing') checkGameOver(io, code, room)
        break
      }
    })
  })
}
