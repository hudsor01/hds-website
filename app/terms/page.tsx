import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Hudson Digital Solutions',
  description:
    'Terms of service for Hudson Digital Solutions. Read our terms and conditions for using our website and services.',
}

export default function TermsPage() {
  return (
    <main className='min-h-screen bg-white py-12'>
      <div className='mx-auto max-w-4xl px-6 lg:px-8'>
        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8'>
          Terms of Service
        </h1>

        <div className='prose prose-lg prose-gray max-w-none'>
          <p className='text-gray-600 mb-8'>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Hudson Digital Solutions website and
            services, you agree to be bound by these Terms of Service. If you do
            not agree to these terms, please do not use our services.
          </p>

          <h2>2. Services</h2>
          <p>
            Hudson Digital Solutions provides web development, business
            automation, and website maintenance services for small businesses
            and solopreneurs. Our services are subject to availability and may
            be modified or discontinued at any time.
          </p>

          <h2>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>
              Provide accurate and complete information when using our services
            </li>
            <li>Use our services in compliance with all applicable laws</li>
            <li>
              Not use our services for any illegal or unauthorized purpose
            </li>
            <li>Not interfere with or disrupt our services or servers</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and
            software, is the property of Hudson Digital Solutions or its
            licensors and is protected by copyright and other intellectual
            property laws.
          </p>

          <h2>5. Payment Terms</h2>
          <p>
            Payment terms for our services will be specified in individual
            service agreements. All fees are non-refundable unless otherwise
            stated in writing.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Hudson Digital Solutions
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or related to your
            use of our services.
          </p>

          <h2>7. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Hudson Digital Solutions,
            its officers, directors, employees, and agents from any claims,
            damages, or expenses arising from your use of our services or
            violation of these terms.
          </p>

          <h2>8. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your access to our
            services at any time, without prior notice, for any reason,
            including breach of these terms.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with
            the laws of [Your State/Country], without regard to its conflict of
            law principles.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of
            any changes by posting the new terms on this page and updating the
            &quot;Last updated&quot; date.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these terms, please contact us at:
          </p>
          <p>
            Hudson Digital Solutions
            <br />
            Email: legal@hudsondigitalsolutions.com
            <br />
            Phone: (555) 123-4567
          </p>
        </div>
      </div>
    </main>
  )
}
