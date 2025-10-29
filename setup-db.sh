#!/bin/bash

# OASARA Database Setup Script
# This script sets up your Supabase database with all tables and initial data

echo "🚀 OASARA Database Setup"
echo "========================"
echo ""

# Supabase connection details
SUPABASE_URL="whklrclzrtijneqdjmiy.supabase.co"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres"

# Prompt for password
echo "Enter your Supabase database password:"
echo "(This is the password you set when creating your Supabase project)"
read -s SUPABASE_PASSWORD
echo ""

# Connection string
export PGPASSWORD="$SUPABASE_PASSWORD"

echo "📊 Connecting to Supabase database..."
echo "Host: $SUPABASE_URL"
echo ""

# Run the setup SQL
echo "🔧 Running database setup..."
psql "postgresql://$SUPABASE_USER:$SUPABASE_PASSWORD@db.$SUPABASE_URL:5432/$SUPABASE_DB?sslmode=require" -f database/SETUP-DATABASE.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "📋 What was created:"
    echo "  ✓ facilities table"
    echo "  ✓ zano_requests table"
    echo "  ✓ 20 initial facilities"
    echo "  ✓ All indexes and security policies"
    echo ""
    echo "🎉 Your database is ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Get Mapbox token"
    echo "  2. Set up EmailJS"
    echo "  3. Run: npm start"
else
    echo ""
    echo "❌ Database setup failed!"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check your database password"
    echo "  - Verify your Supabase project is active"
    echo "  - Try running the SQL manually in Supabase dashboard"
fi

# Clear password from environment
unset PGPASSWORD
