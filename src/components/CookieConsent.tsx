'use client';

import { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export default function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    showPreferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setIsVisible(false);
    onAccept?.();
  };

  const handleRejectAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setIsVisible(false);
    onReject?.();
  };

  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: Date.now(),
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setIsVisible(false);
    
    if (preferences.analytics || preferences.marketing) {
      onAccept?.();
    } else {
      onReject?.();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-gray-800 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              We value your privacy
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized content, 
              and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
              You can customize your preferences or learn more in our{' '}
              <a href="/privacy" className="text-secondary-400 hover:text-secondary-300 underline">
                Privacy Policy
              </a>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Reject All
            </button>
            
            <button
              onClick={() => setPreferences(prev => ({ ...prev, showPreferences: true }))}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors text-sm font-medium"
            >
              Customize
            </button>
            
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 bg-secondary-400 text-black font-semibold rounded-lg hover:bg-secondary-400/90 transition-colors text-sm"
            >
              Accept All
            </button>
          </div>
        </div>

        {preferences.showPreferences && (
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h4 className="text-white font-semibold mb-4">Cookie Preferences</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium text-sm">Necessary Cookies</label>
                  <p className="text-gray-400 text-xs">Required for basic site functionality</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="w-4 h-4 text-secondary-400 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium text-sm">Analytics Cookies</label>
                  <p className="text-gray-400 text-xs">Help us understand how you use our site</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="w-4 h-4 text-secondary-400 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium text-sm">Marketing Cookies</label>
                  <p className="text-gray-400 text-xs">Used to deliver personalized content</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="w-4 h-4 text-secondary-400 rounded"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setPreferences(prev => ({ ...prev, showPreferences: false }))}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-secondary-400 text-black font-semibold rounded-lg hover:bg-secondary-400/90 transition-colors text-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}