#!/bin/bash

echo "🔍 SmartATM System Check"
echo "========================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
fi
echo ""

# Check NPM
echo "📦 Checking NPM..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ NPM installed: $NPM_VERSION"
else
    echo "❌ NPM not installed"
fi
echo ""

# Check Backend Files
echo "📁 Checking Backend Files..."
if [ -f "backend/server.js" ]; then
    echo "✅ backend/server.js exists"
else
    echo "❌ backend/server.js missing"
fi

if [ -f "backend/package.json" ]; then
    echo "✅ backend/package.json exists"
else
    echo "❌ backend/package.json missing"
fi

if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
else
    echo "❌ backend/.env missing"
fi

if [ -d "backend/node_modules" ]; then
    echo "✅ backend/node_modules exists"
else
    echo "⚠️  backend/node_modules missing - run: cd backend && npm install"
fi
echo ""

# Check Frontend Files
echo "📁 Checking Frontend Files..."
if [ -f "frontend/package.json" ]; then
    echo "✅ frontend/package.json exists"
else
    echo "❌ frontend/package.json missing"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ frontend/node_modules exists"
else
    echo "⚠️  frontend/node_modules missing - run: cd frontend && npm install"
fi

if [ -d "frontend/app" ]; then
    echo "✅ frontend/app directory exists"
else
    echo "❌ frontend/app directory missing"
fi
echo ""

# Check Ports
echo "🔌 Checking Ports..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5000 is in use (Backend might be running)"
    PID=$(lsof -ti:5000)
    echo "   Process ID: $PID"
else
    echo "✅ Port 5000 is free"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use (Frontend might be running)"
    PID=$(lsof -ti:3000)
    echo "   Process ID: $PID"
else
    echo "✅ Port 3000 is free"
fi
echo ""

# Check Backend Server
echo "🌐 Checking Backend Server..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend server is running and responding"
    RESPONSE=$(curl -s http://localhost:5000/health)
    echo "   Response: $RESPONSE"
else
    echo "❌ Backend server is not responding"
    echo "   Start with: cd backend && node server.js"
fi
echo ""

# Check Frontend Server
echo "🌐 Checking Frontend Server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend server is running and responding"
else
    echo "❌ Frontend server is not responding"
    echo "   Start with: cd frontend && npm run dev"
fi
echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo ""
echo "Next Steps:"
echo ""

if [ ! -d "backend/node_modules" ]; then
    echo "1. Install backend dependencies:"
    echo "   cd backend && npm install"
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "2. Install frontend dependencies:"
    echo "   cd frontend && npm install"
    echo ""
fi

if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "3. Start backend server:"
    echo "   cd backend && node server.js"
    echo ""
fi

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "4. Start frontend server (in new terminal):"
    echo "   cd frontend && npm run dev"
    echo ""
fi

echo "5. Open browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "✅ System check complete!"
