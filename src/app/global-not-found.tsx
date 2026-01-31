import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 32px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#6b7280',
            }}>
              404
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#111827',
            }}>
              Page Not Found
            </h1>

            <p style={{
              color: '#6b7280',
              marginBottom: '32px',
              lineHeight: '1.6',
              fontSize: '18px',
            }}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Let&apos;s get you back on track.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link
                href="/"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#06b6d4',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'inline-block',
                }}
              >
                Go Home
              </Link>

              <Link
                href="/contact"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#06b6d4',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #06b6d4',
                  display: 'inline-block',
                }}
              >
                Contact Us
              </Link>
            </div>

            <div style={{
              marginTop: '48px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#111827',
              }}>
                Popular Pages
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}>
                <Link
                  href="/services"
                  style={{
                    color: '#06b6d4',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Services
                </Link>
                <Link
                  href="/showcase"
                  style={{
                    color: '#06b6d4',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Portfolio
                </Link>
                <Link
                  href="/about"
                  style={{
                    color: '#06b6d4',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  About Us
                </Link>
                <Link
                  href="/blog"
                  style={{
                    color: '#06b6d4',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}