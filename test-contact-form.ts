// Test script for contact form API
// Run with: npx tsx test-contact-form.ts

async function testContactForm() {
  const testData = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "(555) 123-4567",
    company: "Test Company",
    service: "Web Development",
    budget: "$10K-25K",
    timeline: "1-3 months",
    message: "This is a test submission to verify the contact form is working correctly and emails are being sent to hello@hudsondigitalsolutions.com"
  };

  try {
    console.log('🧪 Testing contact form API...');
    console.log('📧 Emails should be sent to: hello@hudsondigitalsolutions.com');
    console.log('📤 Test data:', testData);

    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result);
      console.log('\n📬 Check your email at hello@hudsondigitalsolutions.com for:');
      console.log('   1. Admin notification with subject: "🚀 New Project Inquiry - Test User"');
      console.log('   2. Client email sent to: test@example.com');
      console.log('\n🔄 Lead nurturing sequence has been scheduled for the test email');
    } else {
      console.error('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

// Run the test
testContactForm();