#!/bin/bash

# Quick Setup Script for Jarvis AI Assistant
# This script helps set up the project quickly for demos

set -e

echo "🤖 Jarvis AI Assistant - Quick Setup Script"
echo "============================================"
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+ first."
    exit 1
fi
echo "✅ Python $(python3 --version) found"

# Install Node dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

# Check for .env
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your API keys:"
    echo "   - OPENROUTER_API_KEY"
    echo "   - PINECONE_API_KEY"
    echo ""
    read -p "Press Enter after you've added your API keys..."
fi

# Install Python dependencies
echo ""
echo "🐍 Installing Python dependencies..."
cd scripts
pip3 install -r requirements.txt
cd ..

# Ingest sample documents
echo ""
read -p "📚 Ingest sample documents now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Ingesting sample documents..."
    python3 scripts/ingest.py --jsonl docs/sample_docs.jsonl
    echo "✅ Sample documents ingested!"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📖 For more info, see README.md"
