#!/usr/bin/env python3
import os
import re

# Files to fix
files = [
    "frontend/app/atm/transfer/page.tsx",
    "frontend/app/atm/dashboard/page.tsx",
    "frontend/app/atm/deposit/page.tsx",
    "frontend/app/atm/changePin/page.tsx",
    "frontend/app/atm/transactionHistory/page.tsx",
    "frontend/app/atm/withdraw/page.tsx",
    "frontend/app/atm/receipt/page.tsx",
    "frontend/app/atm/converter/page.tsx",
    "frontend/app/atm/emergency/page.tsx",
    "frontend/app/atm/limits/page.tsx",
    "frontend/app/atm/blockCard/page.tsx",
    "frontend/app/atm/login/page.tsx",
    "frontend/app/admin/dashboard/page.jsx",
    "frontend/app/admin/test-connection/page.jsx",
    "frontend/app/admin/settings/page.jsx",
    "frontend/app/admin/atm-monitoring/page.jsx",
    "frontend/app/admin/notifications/page.jsx",
    "frontend/app/admin/analytics/page.jsx",
    "frontend/app/admin/login/page.jsx",
]

count = 0
for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace hardcoded URL
        new_content = content.replace(
            "const API_URL = 'http://localhost:5000';",
            "const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';"
        )
        
        # Replace comment
        new_content = new_content.replace(
            "// Hardcoded API URL for testing",
            "// Use environment variable for backend URL"
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Fixed: {filepath}")
            count += 1
        else:
            print(f"- Skipped: {filepath} (already fixed or not found)")
    else:
        print(f"✗ Not found: {filepath}")

print(f"\n✅ Fixed {count} files!")
