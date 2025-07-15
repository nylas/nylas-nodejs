#!/bin/bash

# Nylas Cloudflare Worker Setup Script
# This script helps you set up the environment for the Nylas attachment worker

echo "🚀 Nylas Cloudflare Worker Setup"
echo "=================================="
echo ""

# Check if required tools are installed
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 16+ and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if wrangler is available
if ! command -v npx wrangler &> /dev/null; then
    echo "❌ Wrangler is not available. Dependencies may not be installed correctly."
    exit 1
fi

echo "✅ Wrangler is available"

echo ""
echo "🔧 Configuration Setup"
echo "======================"

# Check if .dev.vars exists and has the required variables
if [ ! -f ".dev.vars" ]; then
    echo "❌ .dev.vars file not found"
    echo ""
    echo "Please create a .dev.vars file with your Nylas credentials:"
    echo ""
         cat << EOF
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_GRANT_ID=your_grant_id_here
TEST_EMAIL=test@example.com
EOF
    echo ""
    exit 1
fi

echo "✅ .dev.vars file found"

# Check if the required environment variables are set (not just empty)
if grep -q "your_nylas_api_key_here" .dev.vars || grep -q "your_grant_id_here" .dev.vars; then
    echo "⚠️  WARNING: .dev.vars still contains placeholder values"
    echo ""
    echo "Please update .dev.vars with your actual Nylas credentials:"
    echo "- NYLAS_API_KEY: Get this from your Nylas Dashboard"
    echo "- NYLAS_GRANT_ID: Get this from your connected accounts"
    echo ""
    echo "You can find these values at: https://dashboard.nylas.com"
    echo ""
fi

# Check wrangler.toml
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found"
    exit 1
fi

echo "✅ wrangler.toml found"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Update .dev.vars with your actual Nylas credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:8787 in your browser"
echo "4. Test uploading a file and sending an email"
echo ""
echo "For deployment:"
echo "1. Set production secrets: wrangler secret put NYLAS_API_KEY"
echo "2. Deploy: npm run deploy"
echo ""
echo "Need help? Check the README.md for detailed instructions." 