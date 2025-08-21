#!/bin/bash

# Hudson Digital Solutions - Pre-commit Workflow
# This script runs comprehensive checks before commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        exit 1
    fi
}

# Function to check for staged files
check_staged_files() {
    if ! git diff --cached --quiet; then
        return 0  # Has staged files
    else
        warning "No staged files found. Nothing to commit."
        return 1  # No staged files
    fi
}

# Function to run linting
run_lint() {
    log "Running ESLint..."
    if npm run lint; then
        success "Linting passed"
        return 0
    else
        error "Linting failed"
        return 1
    fi
}

# Function to run type checking
run_typecheck() {
    log "Running TypeScript type checking..."
    if npm run typecheck; then
        success "Type checking passed"
        return 0
    else
        error "Type checking failed"
        return 1
    fi
}

# Function to run tests
run_tests() {
    log "Running fast test suite..."
    if npm run test:e2e:fast; then
        success "Tests passed"
        return 0
    else
        error "Tests failed"
        return 1
    fi
}

# Function to validate environment
validate_environment() {
    log "Validating environment configuration..."
    if npm run env:validate; then
        success "Environment validation passed"
        return 0
    else
        warning "Environment validation failed (continuing anyway)"
        return 0  # Don't fail commit on env validation
    fi
}

# Function to check for sensitive information
check_sensitive_info() {
    log "Checking for sensitive information..."
    
    # Patterns to search for
    local patterns=(
        "password"
        "secret"
        "key.*="
        "token"
        "api_key"
        "auth"
        "private"
    )
    
    local sensitive_found=false
    
    for pattern in "${patterns[@]}"; do
        if git diff --cached --name-only | xargs grep -l -i "$pattern" 2>/dev/null; then
            warning "Potential sensitive information found matching pattern: $pattern"
            git diff --cached --name-only | xargs grep -n -i "$pattern" 2>/dev/null || true
            sensitive_found=true
        fi
    done
    
    if [[ "$sensitive_found" == true ]]; then
        warning "Please review the above matches for sensitive information"
        read -p "Continue with commit? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Commit aborted by user"
            exit 1
        fi
    else
        success "No obvious sensitive information found"
    fi
}

# Function to check bundle size
check_bundle_size() {
    log "Checking bundle size impact..."
    
    # Build current version
    if npm run build:local > /dev/null 2>&1; then
        if [[ -f ".next/analyze/client.html" ]]; then
            log "Bundle analysis available at .next/analyze/client.html"
        fi
        success "Build successful"
        return 0
    else
        error "Build failed"
        return 1
    fi
}

# Function to run security checks
run_security_checks() {
    log "Running security checks..."
    
    # Check for npm audit issues
    if npm audit --audit-level moderate; then
        success "No moderate+ security vulnerabilities found"
    else
        warning "Security vulnerabilities detected. Run 'npm audit fix' to resolve."
        read -p "Continue with commit despite vulnerabilities? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Commit aborted due to security vulnerabilities"
            exit 1
        fi
    fi
}

# Function to update sitemap if needed
update_sitemap() {
    log "Checking if sitemap needs updating..."
    
    # Check if any route files were modified
    if git diff --cached --name-only | grep -E "(page\.(tsx?|jsx?)|route\.(tsx?|jsx?))" > /dev/null; then
        log "Route files modified, updating sitemap..."
        npm run generate-sitemap
        
        # Add updated sitemap to commit if it changed
        if [[ -f "public/sitemap.xml" ]] && git diff --quiet public/sitemap.xml; then
            log "Sitemap unchanged"
        else
            git add public/sitemap.xml
            success "Sitemap updated and added to commit"
        fi
    else
        log "No route files modified, skipping sitemap update"
    fi
}

# Main pre-commit workflow
main() {
    echo ""
    log "🔍 Starting pre-commit workflow for Hudson Digital Solutions..."
    echo ""
    
    # Check if we're in a git repo
    check_git_repo
    
    # Check if there are staged files
    if ! check_staged_files; then
        exit 0
    fi
    
    # Run all checks
    local exit_code=0
    
    # Environment validation (non-blocking)
    validate_environment || true
    
    # Sensitive information check
    check_sensitive_info || exit_code=1
    
    # Code quality checks
    run_lint || exit_code=1
    run_typecheck || exit_code=1
    
    # Update sitemap if needed
    update_sitemap || true
    
    # Security checks
    run_security_checks || exit_code=1
    
    # Build check
    check_bundle_size || exit_code=1
    
    # Run tests (can be skipped with --skip-tests)
    if [[ "$1" != "--skip-tests" ]]; then
        run_tests || exit_code=1
    else
        warning "Skipping tests as requested"
    fi
    
    echo ""
    if [[ $exit_code -eq 0 ]]; then
        success "🎉 All pre-commit checks passed! Ready to commit."
        echo ""
        echo "To commit your changes, run:"
        echo "  git commit -m \"Your commit message\""
        echo ""
        echo "Or run this script as a git hook by creating .git/hooks/pre-commit with:"
        echo "  #!/bin/bash"
        echo "  ./scripts/pre-commit.sh"
    else
        error "❌ Pre-commit checks failed. Please fix the issues above before committing."
        echo ""
        echo "To skip tests, run: ./scripts/pre-commit.sh --skip-tests"
    fi
    
    exit $exit_code
}

# Run with error handling
trap 'error "Pre-commit script interrupted"; exit 1' INT TERM

main "$@"