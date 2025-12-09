/**
 * Password Generator
 * Generate secure, random passwords with customizable options
 */

'use client';

import { useState, useCallback } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { trackEvent } from '@/lib/analytics';
import { Copy, Check, Key, RefreshCw, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { logger } from '@/lib/logger';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface GeneratedPassword {
  password: string;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  copied: boolean;
}

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [passwords, setPasswords] = useState<GeneratedPassword[]>([]);
  const [count, setCount] = useState(1);

  const calculateStrength = useCallback((password: string, opts: PasswordOptions): GeneratedPassword['strength'] => {
    let score = 0;

    // Length scoring
    if (password.length >= 8) {score += 1;}
    if (password.length >= 12) {score += 1;}
    if (password.length >= 16) {score += 1;}
    if (password.length >= 20) {score += 1;}

    // Character variety scoring
    const charTypes = [opts.uppercase, opts.lowercase, opts.numbers, opts.symbols].filter(Boolean).length;
    score += charTypes;

    if (score <= 2) {return 'weak';}
    if (score <= 4) {return 'fair';}
    if (score <= 6) {return 'good';}
    if (score <= 7) {return 'strong';}
    return 'very-strong';
  }, []);

  const generatePassword = useCallback((opts: PasswordOptions): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    let password = '';

    // Build character set
    if (opts.uppercase) {chars += uppercase;}
    if (opts.lowercase) {chars += lowercase;}
    if (opts.numbers) {chars += numbers;}
    if (opts.symbols) {chars += symbols;}

    if (!chars) {chars = lowercase;} // Fallback

    // Ensure at least one character from each selected type
    const required: string[] = [];
    if (opts.uppercase) {required.push(uppercase.charAt(Math.floor(Math.random() * uppercase.length)));}
    if (opts.lowercase) {required.push(lowercase.charAt(Math.floor(Math.random() * lowercase.length)));}
    if (opts.numbers) {required.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));}
    if (opts.symbols) {required.push(symbols.charAt(Math.floor(Math.random() * symbols.length)));}

    // Generate remaining characters
    const remainingLength = opts.length - required.length;
    for (let i = 0; i < remainingLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Combine and shuffle
    const combined = [...password, ...required];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = combined[i];
      combined[i] = combined[j] ?? '';
      combined[j] = temp ?? '';
    }

    return combined.join('');
  }, []);

  const handleGenerate = () => {
    const newPasswords: GeneratedPassword[] = [];

    for (let i = 0; i < count; i++) {
      const password = generatePassword(options);
      newPasswords.push({
        password,
        strength: calculateStrength(password, options),
        copied: false,
      });
    }

    setPasswords(newPasswords);

    trackEvent('calculator_used', {
      calculator_type: 'password-generator',
      password_length: options.length,
      count: count,
      has_uppercase: options.uppercase,
      has_lowercase: options.lowercase,
      has_numbers: options.numbers,
      has_symbols: options.symbols,
    });
  };

  const copyToClipboard = async (index: number) => {
    const passwordEntry = passwords[index];
    if (!passwordEntry) {return;}

    try {
      await navigator.clipboard.writeText(passwordEntry.password);
      setPasswords(prev => prev.map((p, i) =>
        i === index ? { ...p, copied: true } : p
      ));
      setTimeout(() => {
        setPasswords(prev => prev.map((p, i) =>
          i === index ? { ...p, copied: false } : p
        ));
      }, 2000);
    } catch (error) {
      // Fallback for browsers without clipboard API
      logger.debug('Clipboard API unavailable, using fallback', {
        error: error instanceof Error ? error.message : String(error),
      });
      const textArea = document.createElement('textarea');
      textArea.value = passwordEntry.password;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setPasswords(prev => prev.map((p, i) =>
        i === index ? { ...p, copied: true } : p
      ));
      setTimeout(() => {
        setPasswords(prev => prev.map((p, i) =>
          i === index ? { ...p, copied: false } : p
        ));
      }, 2000);
    }
  };

  const getStrengthColor = (strength: GeneratedPassword['strength']) => {
    switch (strength) {
      case 'weak': return 'text-destructive bg-destructive-muted dark:bg-destructive-bg-dark/30';
      case 'fair': return 'text-orange bg-orange/20 dark:bg-orange-text/30';
      case 'good': return 'text-warning bg-warning-muted dark:bg-warning-bg-dark/30';
      case 'strong': return 'text-success bg-success-muted dark:bg-success-bg-dark/30';
      case 'very-strong': return 'text-primary/80 bg-accent/20 dark:bg-primary-hover/30';
    }
  };

  const getStrengthIcon = (strength: GeneratedPassword['strength']) => {
    switch (strength) {
      case 'weak':
      case 'fair':
        return <ShieldAlert className="w-4 h-4" />;
      case 'good':
        return <Shield className="w-4 h-4" />;
      case 'strong':
      case 'very-strong':
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const getStrengthBar = (strength: GeneratedPassword['strength']) => {
    const widths = {
      'weak': 'w-1/5',
      'fair': 'w-2/5',
      'good': 'w-3/5',
      'strong': 'w-4/5',
      'very-strong': 'w-full',
    };
    const colors = {
      'weak': 'bg-destructive',
      'fair': 'bg-orange',
      'good': 'bg-warning',
      'strong': 'bg-success',
      'very-strong': 'bg-primary/80',
    };
    return { width: widths[strength], color: colors[strength] };
  };

  const atLeastOneSelected = options.uppercase || options.lowercase || options.numbers || options.symbols;

  return (
    <CalculatorLayout
      title="Password Generator"
      description="Generate secure, random passwords with customizable length and character options"
      icon={
        <Key className="h-8 w-8 text-primary" />
      }
    >
      <div className="space-y-comfortable">
        {/* Options */}
        <div className="space-y-content">
          {/* Length Slider */}
          <div>
            <div className="flex justify-between items-center mb-subheading">
              <label className="text-sm font-medium text-foreground">
                Password Length
              </label>
              <span className="text-lg font-bold text-primary">{options.length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="128"
              value={options.length}
              onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>8</span>
              <span>32</span>
              <span>64</span>
              <span>128</span>
            </div>
          </div>

          {/* Character Options */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={(e) => setOptions(prev => ({ ...prev, uppercase: e.target.checked }))}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground">Uppercase</div>
                <div className="text-xs text-muted-foreground">A-Z</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(e) => setOptions(prev => ({ ...prev, lowercase: e.target.checked }))}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground">Lowercase</div>
                <div className="text-xs text-muted-foreground">a-z</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={options.numbers}
                onChange={(e) => setOptions(prev => ({ ...prev, numbers: e.target.checked }))}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground">Numbers</div>
                <div className="text-xs text-muted-foreground">0-9</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={options.symbols}
                onChange={(e) => setOptions(prev => ({ ...prev, symbols: e.target.checked }))}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-foreground">Symbols</div>
                <div className="text-xs text-muted-foreground">!@#$%^&*</div>
              </div>
            </label>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-subheading">
              Number of Passwords
            </label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground"
            >
              <option value={1}>1 password</option>
              <option value={3}>3 passwords</option>
              <option value={5}>5 passwords</option>
              <option value={10}>10 passwords</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!atLeastOneSelected}
          className="w-full flex items-center justify-center gap-tight rounded-md bg-primary px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5" />
          Generate {count > 1 ? 'Passwords' : 'Password'}
        </button>

        {!atLeastOneSelected && (
          <p className="text-sm text-destructive text-center">
            Please select at least one character type
          </p>
        )}

        {/* Generated Passwords */}
        {passwords.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Generated Passwords
            </h3>

            {passwords.map((item, index) => {
              const strengthBar = getStrengthBar(item.strength);
              return (
                <div
                  key={index}
                  className="rounded-lg border border-border card-padding-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <code className="flex-1 font-mono text-sm bg-background text-foreground p-3 rounded-md overflow-x-auto">
                      {item.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(index)}
                      className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-foreground hover:bg-primary-hover transition-colors shrink-0"
                    >
                      {item.copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Strength Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${strengthBar.width} ${strengthBar.color} transition-all`} />
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(item.strength)}`}>
                      {getStrengthIcon(item.strength)}
                      {item.strength.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security Notice */}
        <div className="rounded-lg bg-info-light card-padding-sm dark:bg-info-bg-dark/20">
          <div className="flex">
            <div className="shrink-0">
              <Shield className="h-5 w-5 text-info-text" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-info-darker dark:text-info-muted">
                <strong>Security Notice:</strong> Passwords are generated entirely in your browser. No passwords are sent to or stored on any server.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
          Password Security Tips
        </h3>

        <div className="grid gap-content sm:grid-cols-2">
          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Use Unique Passwords
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Never reuse passwords across multiple accounts. If one gets compromised, others stay safe.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Length Over Complexity
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              A longer password is generally more secure than a shorter complex one. Aim for 16+ characters.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Use a Password Manager
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Store passwords in a reputable password manager like 1Password, Bitwarden, or LastPass.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Enable 2FA
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Add two-factor authentication wherever possible for an extra layer of security.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
