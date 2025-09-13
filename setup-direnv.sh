#!/bin/bash

# ===========================================
# direnv Setup Script for Hudson Digital Solutions
# ===========================================

echo "🔧 Setting up direnv for environment management..."

# Check if direnv is installed
if ! command -v direnv &> /dev/null; then
    echo "❌ direnv is not installed. Installing via Homebrew..."
    brew install direnv
else
    echo "✅ direnv is already installed"
fi

# Check if direnv hook is configured in shell
echo ""
echo "📋 Shell Integration Setup:"
echo "Add this line to your shell configuration file:"
echo ""

# Detect shell and provide appropriate instructions
if [[ "$SHELL" == *"zsh"* ]]; then
    echo "For Zsh (~/.zshrc):"
    echo "eval \"\$(direnv hook zsh)\""
    
    # Check if it's already configured
    if grep -q "direnv hook zsh" ~/.zshrc 2>/dev/null; then
        echo "✅ direnv hook already configured in ~/.zshrc"
    else
        echo ""
        read -p "🤔 Add direnv hook to ~/.zshrc automatically? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
            echo "✅ Added direnv hook to ~/.zshrc"
        else
            echo "⚠️  You'll need to add the hook manually"
        fi
    fi
elif [[ "$SHELL" == *"bash"* ]]; then
    echo "For Bash (~/.bashrc or ~/.bash_profile):"
    echo "eval \"\$(direnv hook bash)\""
else
    echo "For other shells, see: https://direnv.net/docs/hook.html"
fi

echo ""
echo "🔐 Environment Variables Setup:"
echo "1. Edit .envrc file with your actual credentials:"
echo "   - RESEND_API_KEY (from https://resend.com/api-keys)"
echo "   - NEXT_PUBLIC_POSTHOG_KEY (from PostHog project settings)"
echo "   - DISCORD_WEBHOOK_URL (from Discord server settings)"
echo ""
echo "2. After editing .envrc, run:"
echo "   direnv allow"
echo ""
echo "3. Test if variables are loaded:"
echo "   echo \$RESEND_API_KEY"
echo ""

# Allow the .envrc file
if [ -f ".envrc" ]; then
    echo "🚀 Allowing .envrc file..."
    direnv allow
    echo "✅ .envrc file has been allowed"
else
    echo "❌ .envrc file not found in current directory"
    exit 1
fi

echo ""
echo "🎉 direnv setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your terminal or run: source ~/.zshrc (or ~/.bashrc)"
echo "2. Edit .envrc with your actual API keys"
echo "3. Run 'direnv allow' after making changes"
echo "4. Test with: npm run dev"
echo ""
echo "🔒 Security Note: .envrc is already added to .gitignore"