#!/bin/bash
# Oasara Monitoring Setup Script
# Run this to complete the monitoring implementation

set -e  # Exit on error

echo "=========================================="
echo "Oasara My Journey - Monitoring Setup"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install Sentry packages
echo -e "${YELLOW}Step 1: Installing Sentry packages...${NC}"
npm install @sentry/react @sentry/browser

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sentry packages installed${NC}"
else
    echo -e "${RED}✗ Failed to install Sentry packages${NC}"
    exit 1
fi

echo ""

# Step 2: Check environment files
echo -e "${YELLOW}Step 2: Checking environment configuration...${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
fi

echo -e "${GREEN}✓ Environment files present${NC}"
echo ""

# Step 3: Display setup instructions
echo -e "${YELLOW}Step 3: Manual setup required${NC}"
echo ""
echo "==================== UptimeRobot Setup ===================="
echo "1. Sign up at https://uptimerobot.com"
echo "2. Add 4 monitors:"
echo "   - My Journey Page: https://oasara.com/my-journey"
echo "   - Journey Chat API: https://oasara.com/.netlify/functions/journey-chat"
echo "   - Oasara Ask API: https://oasara.com/.netlify/functions/oasara-ask"
echo "   - Onboarding API: https://oasara.com/.netlify/functions/onboarding-chat"
echo "3. Set check interval: 5 minutes"
echo "4. Add alert contacts (email/SMS)"
echo ""

echo "==================== Sentry Setup ===================="
echo "1. Sign up at https://sentry.io"
echo "2. Create new project: 'Oasara Marketplace' (React)"
echo "3. Copy your DSN (looks like: https://xxx@sentry.io/xxx)"
echo "4. Add to .env.local:"
echo "   REACT_APP_SENTRY_DSN=your_dsn_here"
echo "   REACT_APP_ENVIRONMENT=development"
echo "5. Add to Netlify environment variables:"
echo "   REACT_APP_SENTRY_DSN=your_dsn_here"
echo "   REACT_APP_ENVIRONMENT=production"
echo ""

echo "==================== Supabase Dashboard ===================="
echo "1. Open: https://supabase.com/dashboard"
echo "2. Navigate to your Oasara project"
echo "3. Review Database → Logs for slow queries"
echo "4. Check Storage usage and bandwidth"
echo "5. Enable alerts in Settings → Alerts"
echo ""

echo "==================== Documentation ===================="
echo "Complete monitoring guide: /Users/aaronday/Documents/CTO/projects/oasara/MONITORING_SETUP.md"
echo ""

# Step 4: Test build
echo -e "${YELLOW}Step 4: Testing build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed - check for errors${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Add Sentry DSN to .env.local and Netlify"
echo "2. Create UptimeRobot monitors"
echo "3. Deploy to production: npm run deploy"
echo "4. Test error tracking: Trigger a test error and check Sentry"
echo ""
