#!/bin/bash

# Remove any network .env.local so socket defaults to localhost:3001
rm -f dragonhack26-app/.env.local

echo ""
echo "  App:     http://localhost:5173"
echo "  Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

(cd backend && npm run dev) &
BACKEND_PID=$!

(cd dragonhack26-app && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
