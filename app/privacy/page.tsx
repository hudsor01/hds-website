import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Hudson Digital Solutions',
  description:
    'Privacy policy for Hudson Digital Solutions. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <main className='min-h-screen bg-white py-12'>
      <div className='mx-auto max-w-4xl px-6 lg:px-8'>
        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8'>
          Privacy Policy
        </h1>

        <div className='prose prose-lg prose-gray max-w-none'>
          <p className='text-gray-600 mb-8'>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Introduction</h2>
          <p>
            Hudson Digital Solutions (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your
            privacy and is committed to protecting your personal data. This
            privacy policy explains how we collect, use, and safeguard your
            information when you visit our website or use our services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>
              <strong>Personal Information:</strong> Name, email address, phone
              number, and company name when you fill out our contact forms or
              subscribe to our newsletter
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our
              website, including IP address, browser type, and pages visited
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies to improve your
              experience on our website
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Respond to your inquiries and provide customer support</li>
            <li>
              Send you newsletters and marketing communications (with your
              consent)
            </li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information only in the following
            circumstances:
          </p>
          <ul>
            <li>
              With service providers who help us operate our business (e.g.,
              email service providers)
            </li>
            <li>When required by law or to protect our rights</li>
            <li>With your consent</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>7. Contact Information</h2>
          <p>
            If you have any questions about this privacy policy or our data
            practices, please contact us at:
          </p>
          <p>
            Hudson Digital Solutions
            <br />
            Email: privacy@hudsondigitalsolutions.com
            <br />
            Phone: (555) 123-4567
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new privacy policy on this page
            and updating the &quot;Last updated&quot; date.
          </p>
        </div>
      </div>
    </main>
  )
}
