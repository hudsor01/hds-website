import * as React from 'react'

interface NewsletterWelcomeProps {
  email: string
  firstName?: string
}

export const NewsletterWelcomeTemplate: React.FC<Readonly<NewsletterWelcomeProps>> = ({
  email,
  firstName = 'there',
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ 
      background: 'linear-gradient(90deg, #059669 0%, #3B82F6 100%)', 
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
        Welcome to the Inside Track! 🎯
      </h1>
      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        margin: '10px 0 0 0',
        fontSize: '16px',
      }}>
        Your weekly dose of business optimization insights
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
          fontSize: '22px',
          marginBottom: '15px',
        }}>
          Hey {firstName}! 👋
        </h2>
        
        <p style={{ 
          color: '#374151',
          lineHeight: '1.6',
          marginBottom: '15px',
          fontSize: '16px',
        }}>
          Thank you for subscribing to the <strong>Hudson Digital Solutions Newsletter</strong>! You&apos;ve just taken the first step toward transforming your business operations.
        </p>
        
        <p style={{ 
          color: '#374151',
          lineHeight: '1.6',
          marginBottom: '20px',
        }}>
          Every week, I&apos;ll share actionable insights, real case studies, and proven strategies that help Dallas-Fort Worth businesses:
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '25px',
      }}>
        <h3 style={{ 
          color: '#1f2937',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #059669',
          paddingBottom: '8px',
        }}>
          🚀 What You&apos;ll Get Every Week
        </h3>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              💡
            </div>
            <div>
              <h4 style={{ 
                color: '#1f2937',
                fontSize: '14px',
                margin: '0 0 5px 0',
                fontWeight: 'bold',
              }}>
                Revenue Operations Insights
              </h4>
              <p style={{ 
                color: '#6b7280',
                fontSize: '13px',
                margin: '0',
                lineHeight: '1.4',
              }}>
                Data-driven strategies to boost revenue and streamline operations
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              📊
            </div>
            <div>
              <h4 style={{ 
                color: '#1f2937',
                fontSize: '14px',
                margin: '0 0 5px 0',
                fontWeight: 'bold',
              }}>
                Real Case Studies
              </h4>
              <p style={{ 
                color: '#6b7280',
                fontSize: '13px',
                margin: '0',
                lineHeight: '1.4',
              }}>
                Behind-the-scenes look at actual client transformations
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              🛠️
            </div>
            <div>
              <h4 style={{ 
                color: '#1f2937',
                fontSize: '14px',
                margin: '0 0 5px 0',
                fontWeight: 'bold',
              }}>
                Actionable Tools & Templates
              </h4>
              <p style={{ 
                color: '#6b7280',
                fontSize: '13px',
                margin: '0',
                lineHeight: '1.4',
              }}>
                Ready-to-use resources you can implement immediately
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#e0e7ff',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              🎯
            </div>
            <div>
              <h4 style={{ 
                color: '#1f2937',
                fontSize: '14px',
                margin: '0 0 5px 0',
                fontWeight: 'bold',
              }}>
                Exclusive Opportunities
              </h4>
              <p style={{ 
                color: '#6b7280',
                fontSize: '13px',
                margin: '0',
                lineHeight: '1.4',
              }}>
                First access to new services, workshops, and special offers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '25px',
        textAlign: 'center',
      }}>
        <h3 style={{ 
          color: '#0c4a6e',
          fontSize: '16px',
          marginBottom: '12px',
        }}>
          🎁 Welcome Gift: Free Business Assessment
        </h3>
        <p style={{ 
          color: '#0c4a6e',
          fontSize: '14px',
          marginBottom: '15px',
          lineHeight: '1.5',
        }}>
          As a thank you for joining, get instant access to our comprehensive Business Operations Assessment Tool - normally $297, yours free!
        </p>
        <a 
          href='https://hudsondigitalsolutions.com/tools/business-assessment'
          style={{ 
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          Claim Your Free Assessment →
        </a>
      </div>

      <div style={{ 
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ 
          margin: '0 0 10px 0',
          fontSize: '16px',
        }}>
          📧 Confirmed Subscription Details
        </h3>
        <p style={{ 
          margin: '0',
          fontSize: '14px',
          opacity: 0.9,
        }}>
          Email: <strong>{email}</strong><br/>
          Frequency: Weekly (Tuesdays at 9 AM CT)<br/>
          Next Issue: Coming this Tuesday!
        </p>
      </div>

      <div style={{ 
        textAlign: 'center',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}>
        <p style={{ 
          color: '#6b7280',
          fontSize: '13px',
          margin: '0 0 10px 0',
        }}>
          Stay connected with us:
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a 
            href='https://linkedin.com/company/hudson-digital-solutions'
            style={{ 
              color: '#3B82F6',
              textDecoration: 'none',
              fontSize: '12px',
            }}
          >
            LinkedIn
          </a>
          <a 
            href='https://twitter.com/hudsondigital'
            style={{ 
              color: '#3B82F6',
              textDecoration: 'none',
              fontSize: '12px',
            }}
          >
            Twitter
          </a>
          <a 
            href='https://hudsondigitalsolutions.com/blog'
            style={{ 
              color: '#3B82F6',
              textDecoration: 'none',
              fontSize: '12px',
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
      color: '#9ca3af',
      fontSize: '11px',
    }}>
      <p style={{ margin: '0 0 5px 0' }}>
        You&apos;re receiving this because you subscribed to Hudson Digital Solutions newsletter
      </p>
      <p style={{ margin: '0' }}>
        <a href='{{unsubscribe_url}}' style={{ color: '#9ca3af' }}>Unsubscribe</a> | 
        <a href='mailto:contact@hudsondigitalsolutions.com' style={{ color: '#9ca3af' }}> Contact Us</a>
      </p>
    </div>
  </div>
)