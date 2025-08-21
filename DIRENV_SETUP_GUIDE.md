# 🔧 direnv Setup Guide

## ✅ What's Been Set Up

1. **direnv installed** ✅ (already available)
2. **`.envrc` file created** with all necessary environment variables
3. **`.gitignore` updated** to exclude `.envrc` from version control
4. **Setup script created** for easy configuration

## 🚀 Quick Start

### Step 1: Configure Your Shell (One-time setup)
Add direnv hook to your shell configuration:

**For Zsh (most common on macOS):**
```bash
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

**For Bash:**
```bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

### Step 2: Edit .envrc with Your Credentials
Open `.envrc` and replace the placeholder values:

```bash
# Required
export RESEND_API_KEY="re_your_actual_resend_key"

# PostHog US region
export NEXT_PUBLIC_POSTHOG_KEY="phc_your_actual_posthog_key"
export NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"

# Optional
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/your_webhook_url"
```

### Step 3: Allow direnv to Load Variables
```bash
direnv allow
```

### Step 4: Test It Works
```bash
echo $RESEND_API_KEY
npm run dev
```

## 📍 Where to Find Your Credentials

### 🔑 **Resend API Key**
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the `re_...` key

### 📊 **PostHog (US Region)**
1. Login to [app.posthog.com](https://app.posthog.com)
2. Go to Project Settings
3. Copy your Project API Key (starts with `phc_`)
4. Since you mentioned US region, use: `https://us.i.posthog.com`

### 💬 **Discord Webhook (Optional)**
1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Create new webhook
4. Copy the webhook URL

### 🔍 **Google Verification (Optional)**
You mentioned your site is already crawled, so this is only needed if you want:
- Search Console access
- Sitemap submission control
- Search performance data

If you want it:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property for `hudsondigitalsolutions.com`
3. Use HTML tag verification method
4. Copy the `content` value from the meta tag

## 🔄 Daily Usage

Once set up, direnv automatically loads your environment variables when you `cd` into the project directory. You'll see:

```bash
direnv: loading ~/Developer/business-website/.envrc
direnv: export +DISCORD_WEBHOOK_URL +NEXT_PUBLIC_APP_URL +NEXT_PUBLIC_POSTHOG_HOST +NEXT_PUBLIC_POSTHOG_KEY +RESEND_API_KEY
```

## 🛡️ Security Benefits

- **No more .env files**: All in one `.envrc` that's gitignored
- **Project-specific**: Variables only load in this directory
- **Shell integration**: Works with any terminal session
- **Secure**: Never committed to version control

## 🎯 Verification Checklist

- [ ] direnv hook added to shell config
- [ ] `.envrc` file updated with real credentials  
- [ ] `direnv allow` executed
- [ ] Environment variables load when entering directory
- [ ] `npm run dev` works without dotenv commands
- [ ] Contact form can send emails in development

## 🚨 Troubleshooting

**Variables not loading?**
```bash
# Check if direnv is hooked
direnv --version

# Manually allow again
direnv allow

# Check what's loaded
direnv show
```

**Shell hook not working?**
Restart terminal after adding the hook to your shell config.

**Still using old .env.local?**
You can keep both - direnv will take precedence, but remove .env.local if you want to use only direnv.

---

## ✨ You're Ready!

With direnv configured, you can now:
1. Update `.envrc` with your real API keys
2. Never worry about environment variables again
3. Deploy to production with confidence

The environment will automatically load whenever you work in this directory! 🎉