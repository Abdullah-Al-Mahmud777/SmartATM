#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "SmartATM Deployment Verification"
echo "=========================================="
echo ""

# Check if backend URL is set in frontend
echo "1. Checking Frontend Environment Configuration..."
if [ -f "frontend/.env.local" ]; then
    BACKEND_URL=$(grep NEXT_PUBLIC_API_URL frontend/.env.local | cut -d '=' -f2)
    if [ -z "$BACKEND_URL" ]; then
        echo -e "${RED}❌ NEXT_PUBLIC_API_URL not set in frontend/.env.local${NC}"
    else
        echo -e "${GREEN}✓ Backend URL configured: $BACKEND_URL${NC}"
        
        # Test backend health endpoint
        echo ""
        echo "2. Testing Backend Health Endpoint..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" 2>/dev/null)
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✓ Backend is responding (HTTP $HTTP_CODE)${NC}"
            echo ""
            echo "Backend Response:"
            curl -s "$BACKEND_URL/health" | jq '.' 2>/dev/null || curl -s "$BACKEND_URL/health"
        else
            echo -e "${RED}❌ Backend not responding (HTTP $HTTP_CODE)${NC}"
            echo -e "${YELLOW}Please check:${NC}"
            echo "  - Backend is deployed on Vercel"
            echo "  - Environment variables are set"
            echo "  - MongoDB connection is working"
        fi
    fi
else
    echo -e "${RED}❌ frontend/.env.local file not found${NC}"
fi

echo ""
echo "3. Checking Backend Configuration Files..."

# Check vercel.json
if [ -f "backend/vercel.json" ]; then
    echo -e "${GREEN}✓ backend/vercel.json exists${NC}"
else
    echo -e "${RED}❌ backend/vercel.json not found${NC}"
fi

# Check if .env exists in backend
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ backend/.env exists${NC}"
    
    # Check for required environment variables
    if grep -q "MONGO_URI" backend/.env; then
        echo -e "${GREEN}  ✓ MONGO_URI is set${NC}"
    else
        echo -e "${RED}  ❌ MONGO_URI not found${NC}"
    fi
    
    if grep -q "JWT_SECRET" backend/.env; then
        echo -e "${GREEN}  ✓ JWT_SECRET is set${NC}"
    else
        echo -e "${RED}  ❌ JWT_SECRET not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ backend/.env not found (OK if using Vercel environment variables)${NC}"
fi

echo ""
echo "=========================================="
echo "Deployment Checklist:"
echo "=========================================="
echo ""
echo "Backend Deployment:"
echo "  1. Deploy backend folder to Vercel"
echo "  2. Set environment variables in Vercel:"
echo "     - MONGO_URI"
echo "     - JWT_SECRET"
echo "     - NODE_ENV=production"
echo "  3. Configure MongoDB Atlas Network Access (0.0.0.0/0)"
echo "  4. Test: https://your-backend.vercel.app/health"
echo ""
echo "Frontend Deployment:"
echo "  1. Update frontend/.env.local with backend URL"
echo "  2. Deploy frontend folder to Vercel"
echo "  3. Set NEXT_PUBLIC_API_URL in Vercel environment variables"
echo "  4. Test: https://smart-atm-three.vercel.app"
echo ""
echo "=========================================="
echo ""
echo "For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
