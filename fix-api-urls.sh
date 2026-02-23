#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fixing Hardcoded API URLs${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Count files with hardcoded localhost
COUNT=$(grep -r "const API_URL = 'http://localhost:5000'" frontend/app --include="*.tsx" --include="*.jsx" | wc -l)
echo -e "${YELLOW}Found $COUNT files with hardcoded localhost URLs${NC}"
echo ""

# Replace in all files
echo -e "${GREEN}Replacing hardcoded URLs with environment variable...${NC}"

# Find and replace in .tsx and .jsx files
find frontend/app -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i "s|const API_URL = 'http://localhost:5000';|const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';|g" {} +

# Also fix the comment
find frontend/app -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i "s|// Hardcoded API URL for testing|// Use environment variable for backend URL|g" {} +

echo ""
echo -e "${GREEN}✓ Replacement complete!${NC}"
echo ""

# Verify changes
NEW_COUNT=$(grep -r "process.env.NEXT_PUBLIC_API_URL" frontend/app --include="*.tsx" --include="*.jsx" | wc -l)
echo -e "${GREEN}Updated $NEW_COUNT files to use environment variable${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "1. Verify changes:"
echo "   git diff frontend/app"
echo ""
echo "2. Test locally:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Commit and push:"
echo "   git add ."
echo "   git commit -m 'Fix: Use environment variable for API URL'"
echo "   git push"
echo ""
echo "4. Vercel will automatically redeploy"
echo ""
echo -e "${BLUE}========================================${NC}"
