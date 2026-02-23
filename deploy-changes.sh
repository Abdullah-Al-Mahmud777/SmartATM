#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SmartATM - Deploy Changes${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Git repository not initialized. Initializing...${NC}"
    git init
    echo ""
fi

# Show changed files
echo -e "${GREEN}Changed files:${NC}"
git status --short
echo ""

# Add all changes
echo -e "${YELLOW}Adding all changes...${NC}"
git add .
echo ""

# Show what will be committed
echo -e "${GREEN}Files to be committed:${NC}"
git diff --cached --name-only
echo ""

# Commit
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Fix CORS and configure Render backend with Vercel frontend"
echo ""

# Push
echo -e "${YELLOW}Pushing to remote...${NC}"
read -p "Do you want to push to remote? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push
    echo ""
    echo -e "${GREEN}✓ Changes pushed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Wait for Render to redeploy backend (2-3 minutes)"
    echo "2. Wait for Vercel to redeploy frontend (1-2 minutes)"
    echo "3. Test: https://smart-atm-three.vercel.app"
    echo ""
else
    echo -e "${YELLOW}Skipped push. You can push manually later with: git push${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Deployment checklist:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Backend (Render):"
echo "  [ ] Redeploy completed"
echo "  [ ] Test: https://smartatm-5s3p.onrender.com/health"
echo ""
echo "Database (MongoDB Atlas):"
echo "  [ ] Network Access: 0.0.0.0/0 added"
echo "  [ ] Database user has proper permissions"
echo ""
echo "Frontend (Vercel):"
echo "  [ ] Environment variable NEXT_PUBLIC_API_URL set"
echo "  [ ] Redeploy completed"
echo "  [ ] Test: https://smart-atm-three.vercel.app"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""
echo "For detailed instructions, see: SETUP_BANGLA.md"
echo ""
