import * as React from 'react'

interface ContactConfirmationProps {
  name: string
  message: string
}

export const ContactConfirmationTemplate: React.FC<Readonly<ContactConfirmationProps>> = ({
  name,
  message,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ 
      background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)', 
      padding: '30px',
      borderRadius: '8px 8px 0 0',
      textAlign: 'center',
    }}>
      <h1 style={{ 
        color: 'white', 
        margin: '0',
        fontSize: '28px',
        fontWeight: 'bold',
      }}>
        Thank You for Reaching Out! ✨
      </h1>
      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        margin: '10px 0 0 0',
        fontSize: '16px',
      }}>
        We&apos;ve received your message and will be in touch soon
      </p>
    </div>
    
    <div style={{ 
      padding: '30px',
      backgroundColor: '#f9fafb',
      borderRadius: '0 0 8px 8px',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ 
          color: '#1f2937',
          fontSize: '20px',
          marginBottom: '15px',
        }}>
          Hi {name}! 👋
        </h2>
        
        <p style={{ 
          color: '#374151',
          lineHeight: '1.6',
          marginBottom: '15px',
        }}>
          Thank you for contacting Hudson Digital Solutions. We&apos;re excited to learn more about your project and explore how we can help transform your business operations.
        </p>
        
        <p style={{ 
          color: '#374151',
          lineHeight: '1.6',
          marginBottom: '20px',
        }}>
          Your message has been received and logged in our system. Our team will review your inquiry and get back to you within 24 hours during business days.
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '25px',
      }}>
        <h3 style={{ 
          color: '#1f2937',
          fontSize: '16px',
          marginBottom: '12px',
          borderBottom: '2px solid #3B82F6',
          paddingBottom: '8px',
        }}>
          📝 Your Message
        </h3>
        <div style={{ 
          color: '#374151',
          lineHeight: '1.6',
          fontStyle: 'italic',
          backgroundColor: '#f8fafc',
          padding: '15px',
          borderRadius: '6px',
          borderLeft: '4px solid #3B82F6',
        }}>
          &quot;{message}&quot;
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#e0f2fe',
        border: '1px solid #0891b2',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '25px',
      }}>
        <h3 style={{ 
          color: '#0e7490',
          fontSize: '16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
        }}>
          🚀 What Happens Next?
        </h3>
        <ul style={{ color: '#0e7490', paddingLeft: '20px', margin: '0' }}>
          <li style={{ marginBottom: '8px' }}>Our team reviews your specific requirements</li>
          <li style={{ marginBottom: '8px' }}>We prepare a customized analysis and proposal</li>
          <li style={{ marginBottom: '8px' }}>Schedule a discovery call to discuss your goals</li>
          <li>Provide detailed recommendations and next steps</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h3 style={{ 
          margin: '0 0 10px 0',
          fontSize: '18px',
        }}>
          Need Immediate Assistance?
        </h3>
        <p style={{ 
          margin: '0 0 15px 0',
          fontSize: '14px',
          opacity: 0.9,
        }}>
          For urgent matters, feel free to reach out directly:
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <a 
            href='mailto:contact@hudsondigitalsolutions.com' 
            style={{ 
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            📧 contact@hudsondigitalsolutions.com
          </a>
          <a 
            href='tel:+1234567890' 
            style={{ 
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            📞 (123) 456-7890
          </a>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center',
        marginTop: '25px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{ 
          color: '#1f2937',
          fontSize: '16px',
          marginBottom: '15px',
        }}>
          Follow Our Journey
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a 
            href='https://linkedin.com/company/hudson-digital-solutions'
            style={{ 
              color: '#3B82F6',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            LinkedIn
          </a>
          <a 
            href='https://twitter.com/hudsondigital'
            style={{ 
              color: '#3B82F6',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Twitter
          </a>
          <a 
            href='https://hudsondigitalsolutions.com/blog'
            style={{ 
              color: '#3B82F6',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Blog
          </a>
        </div>
      </div>
    </div>

    <div style={{ 
      textAlign: 'center',
      marginTop: '20px',
      color: '#6b7280',
      fontSize: '12px',
    }}>
      <p style={{ margin: '0 0 5px 0' }}>
        Hudson Digital Solutions | Transforming Business Operations
      </p>
      <p style={{ margin: '0' }}>
        Dallas-Fort Worth, Texas | © 2025 All Rights Reserved
      </p>
    </div>
  </div>
)