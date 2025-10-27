#!/bin/bash

echo "🚀 Setting up Verbi Example App..."

# Go to the root of the monorepo
cd ../..

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
pnpm install

# Build the verbi package
echo "🔨 Building Verbi package..."
cd packages/verbi
pnpm build

# Return to example app
cd ../../examples/my-app

# Copy env template if .env.local doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cp .env.local.example .env.local
  echo "⚠️  Please add your OpenAI API key to .env.local"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to .env.local"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Visit http://localhost:3000"