#!/bin/bash

# Auto-detect local network IP
IP=$(ipconfig 2>/dev/null | grep "IPv4" | grep -v "127.0.0.1" | head -1 | awk '{print $NF}' | tr -d '\r')
if [ -z "$IP" ]; then
  IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

if [ -n "$IP" ]; then
  echo "VITE_SOCKET_URL=http://$IP:3001" > dragonhack26-app/.env.local
  echo ""
  echo "  App:     http://$IP:5173"
  echo "  Backend: http://$IP:3001"
  echo ""
else
  echo "Could not detect local IP — set VITE_SOCKET_URL manually in dragonhack26-app/.env.local"
fi

# Start both servers
(cd backend && npm run dev) &
BACKEND_PID=$!

(cd dragonhack26-app && npm run dev -- --host) &
FRONTEND_PID=$!

echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
