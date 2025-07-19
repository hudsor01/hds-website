"use client";
import { useEffect } from 'react';
import { CalendarDaysIcon, ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { trackEvent } from '@/lib/analytics';

export default function CalendarWidget() {
  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    
    script.onload = () => {
      // Track calendar widget loaded
      trackEvent('calendar_widget_loaded', 'engagement', 'cal.com');
    };
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Calendar Section Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CalendarDaysIcon className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-black text-white">Schedule Your Free Strategy Call</h2>
        </div>
        <p className="text-gray-300 max-w-md mx-auto mb-6">
          Let&apos;s discuss your project in detail and how I can help you achieve your goals
        </p>
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-2 justify-center text-gray-300">
            <ClockIcon className="w-5 h-5 text-green-400" />
            <span className="text-sm">30 minutes</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-gray-300">
            <VideoCameraIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm">Video call</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-gray-300">
            <span className="w-5 h-5 text-yellow-400">💡</span>
            <span className="text-sm">Free insights</span>
          </div>
        </div>
      </div>

      {/* Cal.com Embed */}
      <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
        <div 
          data-cal-link="richard-hudson/service-consultation"
          data-cal-config='{"layout":"month_view","theme":"light","branding":{"brandColor":"#00D9FF","lightColor":"#06B6D4","darkColor":"#0F172A"}}'
          style={{ width: '100%', height: '600px', overflow: 'scroll' }}
          onClick={() => trackEvent('calendar_interaction', 'engagement', 'cal.com_embed')}
        >
          {/* Fallback content while loading */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading calendar...</p>
              <p className="text-sm text-gray-500 mt-2">
                <a 
                  href="https://cal.com/richard-hudson/service-consultation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:text-cyan-800"
                  onClick={() => trackEvent('calendar_fallback_click', 'engagement', 'cal.com_direct')}
                >
                  Click here if calendar doesn&apos;t load
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional CTA */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-4">
          Prefer to call directly? <a 
            href="tel:+1234567890" 
            className="text-cyan-400 hover:text-cyan-300"
            onClick={() => trackEvent('phone_click', 'contact', 'calendar_widget')}
          >+1 (234) 567-890</a>
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <span>✓ No sales pitch</span>
          <span>✓ Actionable advice</span>
          <span>✓ Custom roadmap</span>
        </div>
      </div>
    </div>
  );
}