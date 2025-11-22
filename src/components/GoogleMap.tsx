"use client";

export default function GoogleMap() {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Dallas-Fort Worth Metroplex
        </h2>
        <p className="text-gray-300 text-lg">
          Serving businesses across the DFW area with cutting-edge digital solutions
        </p>
      </div>
      
      <div className="relative rounded-xl overflow-hidden shadow-2xl border border-cyan-300/30">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d435519.2274138779!2d-97.3307073!3d32.7766642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c19f77b45974b%3A0xb9ec9ba4f647678f!2sDallas-Fort%20Worth%20Metroplex%2C%20TX!5e0!3m2!1sen!2sus!4v1645123456789!5m2!1sen!2sus"
          width="100%"
          height="450"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Dallas-Fort Worth Metroplex Map"
          className="w-full border-0"
        />
        
        {/* Overlay gradient for better integration */}
        <div className="absolute inset-0 pointer-events-none overlay-gradient-light"></div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Ready to transform your business? We&apos;re here to help companies across the metroplex achieve digital excellence.
        </p>
      </div>
    </div>
  );
}