import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Service data (in a real app, this would come from a database or CMS)
const servicesData = {
  'web-development': {
    title: 'Web Development',
    description: 'Custom websites and applications',
    color: '#3B82F6',
  },
  'revenue-operations': {
    title: 'Revenue Operations',
    description: 'Optimize your sales and marketing',
    color: '#10B981',
  },
  'data-analytics': {
    title: 'Data Analytics',
    description: 'Transform data into insights',
    color: '#8B5CF6',
  },
}

// Dynamic OG image generation for services
export default async function ServiceOGImage({ 
  params, 
}: { 
  params: Promise<{ service: string }> 
}) {
  const { service } = await params
  const serviceData = servicesData[service as keyof typeof servicesData] || {
    title: 'Our Services',
    description: 'Professional business solutions',
    color: '#1F2937',
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${serviceData.color} 0%, #1F2937 100%)`,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Logo/Brand Area */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: serviceData.color,
              }}
            >
              H
            </div>
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            Hudson Digital Solutions
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 60px',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: '1.1',
              marginBottom: '24px',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            {serviceData.title}
          </h1>
          
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '400',
              lineHeight: '1.3',
              maxWidth: '800px',
            }}
          >
            {serviceData.description}
          </p>
        </div>

        {/* Bottom Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Professional Services
          </div>
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '8%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}