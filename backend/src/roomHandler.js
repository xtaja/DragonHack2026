// rooms: Map<code, { code, host, members: Map<socketId, {username}>, foods, swipes: Map<foodId, Set<socketId>>, status }>
const rooms = new Map()

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function memberList(room) {
  return [...room.members.values()].map(m => ({ username: m.username }))
}

export function setupRoomHandler(io) {
  io.on('connection', (socket) => {

    socket.on('create-room', ({ username }) => {
      const code = generateCode()
      rooms.set(code, {
        code,
        host: socket.id,
        members: new Map([[socket.id, { username }]]),
        foods: null,
        swipes: new Map(),
        status: 'waiting',
      })
      socket.join(code)
      socket.emit('room-created', { code, members: [{ username }], isHost: true })
    })

    socket.on('join-room', ({ roomCode, username }) => {
      const room = rooms.get(roomCode)
      if (!room) { socket.emit('room-error', { message: 'Room not found.' }); return }
      if (room.status !== 'waiting') { socket.emit('room-error', { message: 'Game already started.' }); return }

      room.members.set(socket.id, { username })
      socket.join(roomCode)
      const members = memberList(room)
      socket.emit('room-joined', { code: roomCode, members, isHost: false })
      socket.to(roomCode).emit('member-joined', { username, members })
    })

    socket.on('start-game', ({ roomCode, foods }) => {
      const room = rooms.get(roomCode)
      if (!room || room.host !== socket.id) return
      room.foods = foods
      room.status = 'playing'
      io.to(roomCode).emit('game-started', { foods })
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

    socket.on('disconnecting', () => {
      for (const [code, room] of rooms) {
        if (!room.members.has(socket.id)) continue
        const { username } = room.members.get(socket.id)
        room.members.delete(socket.id)
        if (room.members.size === 0) {
          rooms.delete(code); break
        }
        if (room.host === socket.id) {
          room.host = [...room.members.keys()][0]
        }
        const members = memberList(room)
        io.to(code).emit('member-left', { username, members })
        break
      }
    })
  })
}
