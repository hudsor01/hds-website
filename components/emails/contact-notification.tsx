import * as React from 'react'

interface ContactNotificationProps {
  name: string
  email: string
  company?: string
  phone?: string
  service?: string
  message: string
  timestamp: string
  sourceUrl?: string
}

export const ContactNotificationTemplate: React.FC<Readonly<ContactNotificationProps>> = ({
  name,
  email,
  company,
  phone,
  service,
  message,
  timestamp,
  sourceUrl,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ 
      background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)', 
      padding: '20px',
      borderRadius: '8px 8px 0 0',
    }}>
      <h1 style={{ 
        color: 'white', 
        margin: '0',
        fontSize: '24px',
        fontWeight: 'bold',
      }}>
        🚀 New Business Inquiry
      </h1>
    </div>
    
    <div style={{ 
      padding: '30px',
      backgroundColor: '#f9fafb',
      borderRadius: '0 0 8px 8px',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          color: '#1f2937',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #3B82F6',
          paddingBottom: '8px',
        }}>
          Contact Details
        </h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ 
              padding: '8px 0',
              fontWeight: 'bold',
              color: '#374151',
              width: '120px',
            }}>
              Name:
            </td>
            <td style={{ padding: '8px 0', color: '#1f2937' }}>{name}</td>
          </tr>
          <tr>
            <td style={{ 
              padding: '8px 0',
              fontWeight: 'bold',
              color: '#374151',
            }}>
              Email:
            </td>
            <td style={{ padding: '8px 0', color: '#1f2937' }}>
              <a href={`mailto:${email}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>
                {email}
              </a>
            </td>
          </tr>
          {company && (
            <tr>
              <td style={{ 
                padding: '8px 0',
                fontWeight: 'bold',
                color: '#374151',
              }}>
                Company:
              </td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{company}</td>
            </tr>
          )}
          {phone && (
            <tr>
              <td style={{ 
                padding: '8px 0',
                fontWeight: 'bold',
                color: '#374151',
              }}>
                Phone:
              </td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>
                <a href={`tel:${phone}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>
                  {phone}
                </a>
              </td>
            </tr>
          )}
          {service && (
            <tr>
              <td style={{ 
                padding: '8px 0',
                fontWeight: 'bold',
                color: '#374151',
              }}>
                Service:
              </td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{service}</td>
            </tr>
          )}
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: '#1f2937',
          fontSize: '16px',
          marginBottom: '10px',
          borderBottom: '1px solid #d1d5db',
          paddingBottom: '5px',
        }}>
          Message
        </h3>
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          color: '#374151',
          lineHeight: '1.6',
        }}>
          {message}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: '#1f2937',
          fontSize: '16px',
          marginBottom: '10px',
          borderBottom: '1px solid #d1d5db',
          paddingBottom: '5px',
        }}>
          Submission Details
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ 
              padding: '5px 0',
              fontWeight: 'bold',
              color: '#374151',
              width: '120px',
            }}>
              Time:
            </td>
            <td style={{ padding: '5px 0', color: '#1f2937' }}>{timestamp}</td>
          </tr>
          {sourceUrl && (
            <tr>
              <td style={{ 
                padding: '5px 0',
                fontWeight: 'bold',
                color: '#374151',
              }}>
                Source Page:
              </td>
              <td style={{ padding: '5px 0', color: '#1f2937' }}>
                <a href={sourceUrl} style={{ color: '#3B82F6', textDecoration: 'none' }}>
                  {sourceUrl}
                </a>
              </td>
            </tr>
          )}
        </table>
      </div>

      <div style={{ 
        backgroundColor: '#3B82F6',
        color: 'white',
        padding: '15px',
        borderRadius: '6px',
        textAlign: 'center',
        marginTop: '25px',
      }}>
        <p style={{ margin: '0', fontSize: '14px' }}>
          💡 <strong>Quick Action:</strong> Reply to this email to respond directly to {name}
        </p>
      </div>
    </div>

    <div style={{ 
      textAlign: 'center',
      marginTop: '20px',
      color: '#6b7280',
      fontSize: '12px',
    }}>
      <p style={{ margin: '0' }}>
        This email was sent from your Hudson Digital Solutions contact form
      </p>
    </div>
  </div>
)