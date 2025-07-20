#!/bin/bash

# Setup local HTTPS certificates for development
# This fixes SSL errors in local development

echo "🔐 Setting up local HTTPS certificates..."

# Create certificates directory
mkdir -p certificates

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed. Installing..."
    
    # Detect OS and install mkcert
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mkcert
            brew install nss # for Firefox
        else
            echo "❌ Homebrew not found. Please install mkcert manually:"
            echo "   https://github.com/FiloSottile/mkcert#installation"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install libnss3-tools
            wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
            sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
            sudo chmod +x /usr/local/bin/mkcert
        else
            echo "❌ Please install mkcert manually:"
            echo "   https://github.com/FiloSottile/mkcert#installation"
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install mkcert manually:"
        echo "   https://github.com/FiloSottile/mkcert#installation"
        exit 1
    fi
fi

# Install local CA
echo "📜 Installing local CA..."
mkcert -install

# Generate certificates
echo "🔨 Generating certificates for localhost..."
cd certificates
mkcert localhost 127.0.0.1 ::1
mv localhost+2.pem localhost.pem
mv localhost+2-key.pem localhost-key.pem

echo "✅ HTTPS certificates created successfully!"
echo ""
echo "📝 To use HTTPS in development:"
echo "   1. Update your .env.local file:"
echo "      HTTPS=true"
echo ""
echo "   2. Start the dev server:"
echo "      npm run dev"
echo ""
echo "   3. Access your site at:"
echo "      https://localhost:3000"
echo ""
echo "🔒 Your browser will now trust the local certificate!"