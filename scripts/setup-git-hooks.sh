#!/bin/bash

# Hudson Digital Solutions - Git Hooks Setup
# Automated Git workflow enhancement with quality gates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create .githooks directory if it doesn't exist
mkdir -p .githooks

# Pre-commit hook
log "Creating pre-commit hook..."
cat > .githooks/pre-commit << 'EOF'
#!/bin/bash

# Hudson Digital Solutions - Pre-commit Hook
# Runs quality checks before allowing commits

set -e

echo "🔍 Running pre-commit quality checks..."

# Check if we have staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No TypeScript/JavaScript files to check"
    exit 0
fi

echo "📁 Checking staged files:"
echo "$STAGED_FILES"

# Run TypeScript type checking
echo "🔍 Running TypeScript type check..."
if ! npm run typecheck; then
    echo "❌ TypeScript type check failed"
    echo "💡 Fix type errors before committing"
    exit 1
fi

# Run ESLint on staged files
echo "🔍 Running ESLint..."
if ! npx eslint $STAGED_FILES; then
    echo "❌ ESLint check failed"
    echo "💡 Run 'npm run lint -- --fix' to auto-fix issues"
    exit 1
fi

# Run Prettier check on staged files
echo "🔍 Checking code formatting..."
if ! npx prettier --check $STAGED_FILES; then
    echo "❌ Code formatting check failed"
    echo "💡 Run 'npx prettier --write $STAGED_FILES' to format code"
    exit 1
fi

# Check for console.log statements (except in development files)
echo "🔍 Checking for console.log statements..."
CONSOLE_LOGS=$(echo "$STAGED_FILES" | xargs grep -l "console\.log" | grep -v "dev\|test\|spec" || true)
if [ ! -z "$CONSOLE_LOGS" ]; then
    echo "⚠️  Found console.log statements in:"
    echo "$CONSOLE_LOGS"
    echo "💡 Remove or replace with proper logging before committing"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for TODO/FIXME comments
echo "🔍 Checking for TODO/FIXME comments..."
TODO_COMMENTS=$(echo "$STAGED_FILES" | xargs grep -l "TODO\|FIXME" || true)
if [ ! -z "$TODO_COMMENTS" ]; then
    echo "📝 Found TODO/FIXME comments in:"
    echo "$TODO_COMMENTS"
    echo "💡 Consider addressing these before committing"
fi

# Check environment variables in committed files
echo "🔍 Checking for potential secrets..."
SECRET_PATTERNS="(api_key|secret|password|token|private_key)"
POTENTIAL_SECRETS=$(echo "$STAGED_FILES" | xargs grep -i "$SECRET_PATTERNS" | grep -v "\.env\.example\|README\|\.md" || true)
if [ ! -z "$POTENTIAL_SECRETS" ]; then
    echo "🚨 POTENTIAL SECRETS DETECTED:"
    echo "$POTENTIAL_SECRETS"
    echo "❌ DO NOT commit secrets to version control"
    exit 1
fi

echo "✅ All pre-commit checks passed!"
EOF

# Pre-push hook
log "Creating pre-push hook..."
cat > .githooks/pre-push << 'EOF'
#!/bin/bash

# Hudson Digital Solutions - Pre-push Hook
# Runs comprehensive tests before pushing

set -e

echo "🚀 Running pre-push checks..."

# Get the current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Skip checks for main branch (should use PR process)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "⚠️  Pushing directly to main branch"
    read -p "Are you sure? This should usually go through a PR (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run full test suite
echo "🧪 Running test suite..."
if ! npm run test:ci; then
    echo "❌ Tests failed"
    echo "💡 Fix failing tests before pushing"
    exit 1
fi

# Check build
echo "🏗️  Testing build..."
if ! npm run build:local; then
    echo "❌ Build failed"
    echo "💡 Fix build errors before pushing"
    exit 1
fi

# Check for large files
echo "🔍 Checking for large files..."
LARGE_FILES=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./playwright-report/*" || true)
if [ ! -z "$LARGE_FILES" ]; then
    echo "⚠️  Large files detected (>10MB):"
    echo "$LARGE_FILES"
    echo "💡 Consider using Git LFS for large files"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ All pre-push checks passed!"
EOF

# Post-commit hook
log "Creating post-commit hook..."
cat > .githooks/post-commit << 'EOF'
#!/bin/bash

# Hudson Digital Solutions - Post-commit Hook
# Runs post-commit automation and notifications

echo "📬 Running post-commit actions..."

# Get commit info
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)
BRANCH_NAME=$(git branch --show-current)

echo "✅ Commit completed: $COMMIT_HASH"
echo "📋 Branch: $BRANCH_NAME"
echo "💬 Message: $COMMIT_MESSAGE"

# Generate updated documentation if docs changed
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "docs/\|README"; then
    echo "📚 Documentation changed, considering regeneration..."
    if [ -f "scripts/ai-docs.sh" ]; then
        echo "🤖 Running documentation regeneration..."
        bash scripts/ai-docs.sh || true
    fi
fi

# Update sitemap if routes changed
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "src/app.*page\.tsx"; then
    echo "🗺️  Routes changed, updating sitemap..."
    npm run generate-sitemap || true
fi

# Trigger analytics if analytics tracking changed
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "analytics\|tracking"; then
    echo "📊 Analytics code changed, validating configuration..."
    # Add analytics validation here
fi

echo "🎉 Post-commit actions completed!"
EOF

# Commit message template
log "Creating commit message template..."
cat > .githooks/commit-msg << 'EOF'
#!/bin/bash

# Hudson Digital Solutions - Commit Message Hook
# Validates commit message format

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# Check if commit message follows conventional commits format
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}"

if [[ ! $COMMIT_MSG =~ $PATTERN ]]; then
    echo "❌ Invalid commit message format"
    echo ""
    echo "Commit message should follow conventional commits format:"
    echo "  <type>[optional scope]: <description>"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo ""
    echo "Examples:"
    echo "  feat: add user authentication"
    echo "  fix(api): resolve contact form validation"
    echo "  docs: update installation guide"
    echo "  test: add unit tests for analytics"
    echo ""
    echo "Current message: $COMMIT_MSG"
    exit 1
fi

# Check commit message length
if [[ ${#COMMIT_MSG} -gt 72 ]]; then
    echo "⚠️  Commit message is longer than 72 characters"
    echo "💡 Consider keeping the first line under 50 characters"
fi

# Check for common typos
if echo "$COMMIT_MSG" | grep -qi "teh\|recieve\|seperate\|definately"; then
    echo "⚠️  Possible typos detected in commit message"
    echo "💡 Please review: $COMMIT_MSG"
fi

echo "✅ Commit message format is valid"
EOF

# Make hooks executable
log "Making hooks executable..."
chmod +x .githooks/*

# Install hooks
log "Installing Git hooks..."
git config core.hooksPath .githooks

# Create prepare-commit-msg hook for auto-generating commit messages
log "Creating prepare-commit-msg hook..."
cat > .githooks/prepare-commit-msg << 'EOF'
#!/bin/bash

# Hudson Digital Solutions - Prepare Commit Message Hook
# Auto-generates commit messages based on changes

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only auto-generate if no message provided and not amending
if [ -z "$COMMIT_SOURCE" ]; then
    # Get staged files
    STAGED_FILES=$(git diff --cached --name-only)
    
    # Analyze changes and suggest commit type
    if echo "$STAGED_FILES" | grep -q "test\|spec"; then
        SUGGESTED_TYPE="test"
    elif echo "$STAGED_FILES" | grep -q "docs/\|README\|\.md$"; then
        SUGGESTED_TYPE="docs"
    elif echo "$STAGED_FILES" | grep -q "package\.json\|package-lock\.json\|\.config\|\.yml$\|\.yaml$"; then
        SUGGESTED_TYPE="chore"
    elif echo "$STAGED_FILES" | grep -q "src/components\|src/styles"; then
        SUGGESTED_TYPE="feat"
    elif echo "$STAGED_FILES" | grep -q "src/app/api"; then
        SUGGESTED_TYPE="feat"
    else
        SUGGESTED_TYPE="feat"
    fi
    
    # Create template
    cat > $COMMIT_MSG_FILE << EOF_TEMPLATE

# Suggested commit type: $SUGGESTED_TYPE
# 
# Please follow conventional commits format:
# <type>[optional scope]: <description>
#
# Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
#
# Staged files:
$(echo "$STAGED_FILES" | sed 's/^/# /')
EOF_TEMPLATE
fi
EOF

chmod +x .githooks/prepare-commit-msg

# Create hook management script
log "Creating hook management script..."
cat > scripts/manage-git-hooks.sh << 'EOF'
#!/bin/bash

# Hudson Digital Solutions - Git Hooks Management

case "$1" in
    "install")
        echo "🔧 Installing Git hooks..."
        git config core.hooksPath .githooks
        chmod +x .githooks/*
        echo "✅ Git hooks installed"
        ;;
    "uninstall")
        echo "🗑️  Uninstalling Git hooks..."
        git config --unset core.hooksPath
        echo "✅ Git hooks uninstalled"
        ;;
    "test")
        echo "🧪 Testing Git hooks..."
        if [ -f ".githooks/pre-commit" ]; then
            echo "Testing pre-commit hook..."
            .githooks/pre-commit
        fi
        echo "✅ Git hooks test completed"
        ;;
    "status")
        echo "📋 Git hooks status:"
        if git config core.hooksPath >/dev/null 2>&1; then
            HOOKS_PATH=$(git config core.hooksPath)
            echo "✅ Hooks enabled: $HOOKS_PATH"
            echo "Available hooks:"
            ls -la .githooks/
        else
            echo "❌ Hooks not configured"
        fi
        ;;
    *)
        echo "Usage: $0 {install|uninstall|test|status}"
        echo ""
        echo "Commands:"
        echo "  install    - Install Git hooks"
        echo "  uninstall  - Uninstall Git hooks"
        echo "  test       - Test Git hooks"
        echo "  status     - Show hooks status"
        ;;
esac
EOF

chmod +x scripts/manage-git-hooks.sh

success "Git hooks setup completed!"
echo ""
echo "📋 Available hooks:"
echo "  ✅ pre-commit     - Quality checks before commit"
echo "  ✅ pre-push       - Tests before push"
echo "  ✅ post-commit    - Actions after commit"
echo "  ✅ commit-msg     - Validates commit message format"
echo "  ✅ prepare-commit-msg - Auto-generates commit templates"
echo ""
echo "🔧 Management commands:"
echo "  ./scripts/manage-git-hooks.sh status    - Check hook status"
echo "  ./scripts/manage-git-hooks.sh test      - Test hooks"
echo "  ./scripts/manage-git-hooks.sh uninstall - Disable hooks"
echo ""
echo "💡 To bypass hooks temporarily, use: git commit --no-verify"