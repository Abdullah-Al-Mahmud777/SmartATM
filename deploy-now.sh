#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           SmartATM - Quick Deployment                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Show what was fixed
echo -e "${GREEN}✅ Fixed Issues:${NC}"
echo "   • Backend CORS configuration"
echo "   • 19 frontend files (removed hardcoded localhost URLs)"
echo "   • Environment configuration"
echo ""

# Step 2: Git status
echo -e "${YELLOW}📋 Changed Files:${NC}"
git status --short | head -10
TOTAL=$(git status --short | wc -l)
if [ $TOTAL -gt 10 ]; then
    echo "   ... and $((TOTAL - 10)) more files"
fi
echo ""

# Step 3: Confirm deployment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
read -p "$(echo -e ${YELLOW}Do you want to commit and push these changes? [y/N]: ${NC})" -n 1 -r
echo ""
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    echo ""
    echo "You can deploy manually later with:"
    echo "  git add ."
    echo "  git commit -m 'Fix: Replace hardcoded localhost URLs'"
    echo "  git push"
    exit 0
fi

# Step 4: Git add
echo -e "${YELLOW}Adding files...${NC}"
git add .
echo -e "${GREEN}✓ Files added${NC}"
echo ""

# Step 5: Git commit
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Fix: Replace hardcoded localhost URLs with environment variable

- Fixed 19 frontend pages to use NEXT_PUBLIC_API_URL
- Updated backend CORS configuration
- Configured environment variables for Render backend

This fixes the 'Unable to connect to server' error in production."

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed${NC}"
else
    echo -e "${RED}✗ Commit failed${NC}"
    exit 1
fi
echo ""

# Step 6: Git push
echo -e "${YELLOW}Pushing to remote...${NC}"
git push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Changes pushed successfully!${NC}"
else
    echo ""
    echo -e "${RED}✗ Push failed${NC}"
    echo "Please check your git configuration and try again."
    exit 1
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Deployment Status                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Code pushed to repository${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for automatic deployments...${NC}"
echo ""
echo "   • Render: Backend will redeploy automatically (2-3 minutes)"
echo "   • Vercel: Frontend will redeploy automatically (1-2 minutes)"
echo ""

# Step 7: Next steps
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT: Complete These Steps!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}1. Set Vercel Environment Variable:${NC}"
echo "   → https://vercel.com/dashboard"
echo "   → Your Project → Settings → Environment Variables"
echo "   → Add:"
echo "      Name: NEXT_PUBLIC_API_URL"
echo "      Value: https://smartatm-5s3p.onrender.com"
echo "      Environment: All (Production, Preview, Development)"
echo ""
echo -e "${YELLOW}2. Redeploy Frontend (if needed):${NC}"
echo "   → Vercel Dashboard → Deployments"
echo "   → Latest deployment → ... → Redeploy"
echo ""
echo -e "${YELLOW}3. Configure MongoDB Atlas (if not done):${NC}"
echo "   → https://cloud.mongodb.com"
echo "   → Network Access → Add IP: 0.0.0.0/0"
echo ""
echo -e "${YELLOW}4. Setup UptimeRobot (Optional but Recommended):${NC}"
echo "   → https://uptimerobot.com"
echo "   → Monitor: https://smartatm-5s3p.onrender.com/health"
echo "   → Interval: 5 minutes"
echo "   → This keeps your Render backend awake (free tier)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🧪 Test Your Application:${NC}"
echo ""
echo "   Backend:  https://smartatm-5s3p.onrender.com/health"
echo "   Frontend: https://smart-atm-three.vercel.app"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📚 For detailed instructions, see: FINAL_FIX_BANGLA.md${NC}"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Deployment Complete! 🎉                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
