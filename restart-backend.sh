#!/bin/bash

echo "🔄 Restarting Backend Server..."

# Kill existing node server.js process
echo "⏹️  Stopping existing server..."
pkill -f "node server.js" 2>/dev/null || pkill -f "node.*backend.*server" 2>/dev/null

# Wait a moment
sleep 2

# Check if process is killed
if pgrep -f "node server.js" > /dev/null; then
    echo "❌ Failed to stop server. Please stop it manually."
    exit 1
fi

echo "✅ Server stopped"

# Start the server in background
echo "🚀 Starting server..."
cd backend
nohup node server.js > ../backend-server.log 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Server started successfully on PID: $SERVER_PID"
    echo "📝 Server logs: backend-server.log"
    echo "🔗 Server URL: http://localhost:5000"
    echo ""
    echo "Testing settings API..."
    sleep 1
    node test-settings-api.js
else
    echo "❌ Server failed to start. Check backend-server.log for errors"
    tail -20 ../backend-server.log
    exit 1
fi
