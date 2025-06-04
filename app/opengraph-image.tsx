import { ImageResponse } from 'next/og';

// Route segment config
export const alt = 'Hudson Digital Solutions - Revenue Operations & Web Development';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2%, transparent 0%), 
                             radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.05) 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />
        
        {/* Logo */}
        <div
          style={{
            background: '#2563eb',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '40px',
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          H
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          Hudson Digital Solutions
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '40px',
            maxWidth: '800px',
          }}
        >
          Revenue Operations & Web Development for Small Business
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: '20px',
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#2563eb', 
              borderRadius: '50%', 
            }} />
            RevOps Expert
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#2563eb', 
              borderRadius: '50%', 
            }} />
            CRM Optimization
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#2563eb', 
              borderRadius: '50%', 
            }} />
            Dallas-Fort Worth
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #2563eb 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}