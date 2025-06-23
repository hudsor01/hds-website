<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <section class="bg-white py-24">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-200">
            <img src="/HDS-Logo.jpeg" alt="Hudson Digital" class="h-8 w-auto" />
            <span class="text-lg font-semibold text-gray-900">Contact</span>
          </div>
        </div>
        <h1 class="text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
        <p class="text-xl text-gray-600">
          Ready to start your project? Let's discuss how we can help bring your vision to life.
        </p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-16">
          <!-- Contact Form -->
          <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid sm:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="form.firstName"
                    required
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="form.lastName"
                    required
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  v-model="form.company"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  placeholder="Your Company"
                />
              </div>
              
              <div>
                <label for="service" class="block text-sm font-medium text-gray-700 mb-2">
                  Service Interest
                </label>
                <select
                  id="service"
                  v-model="form.service"
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                >
                  <option value="">Select a service</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="digital-strategy">Digital Strategy</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
                  Project Budget
                </label>
                <select
                  id="budget"
                  v-model="form.budget"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                >
                  <option value="">Select budget range</option>
                  <option value="under-5k">Under $5,000</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="over-50k">Over $50,000</option>
                </select>
              </div>
              
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                  Project Details
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  required
                  rows="5"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                  placeholder="Tell us about your project, goals, and timeline..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
          
          <!-- Contact Info -->
          <div class="space-y-8">
            <div 
              v-for="contact in contactInfo" 
              :key="contact.title"
              class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex items-start">
                <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <component :is="contact.icon" class="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">{{ contact.title }}</h3>
                  <p class="text-gray-600 mb-3">{{ contact.description }}</p>
                  <a 
                    :href="contact.link" 
                    class="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    {{ contact.value }}
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Business Hours -->
            <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Business Hours</h3>
              <div class="space-y-2 text-gray-600">
                <div class="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM CST</span>
                </div>
                <div class="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM CST</span>
                </div>
                <div class="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon
} from '@heroicons/vue/24/outline'

const contactInfo = [
  {
    icon: EnvelopeIcon,
    title: 'Email Us',
    description: 'Send us an email and we\'ll respond within 24 hours.',
    value: 'hello@hudsondigital.com',
    link: 'mailto:hello@hudsondigital.com'
  },
  {
    icon: PhoneIcon,
    title: 'Call Us',
    description: 'Speak with our team during business hours.',
    value: '+1 (214) 555-0123',
    link: 'tel:+12145550123'
  },
  {
    icon: MapPinIcon,
    title: 'Visit Us',
    description: 'Located in the heart of Dallas, Texas.',
    value: 'Dallas, TX 75201',
    link: 'https://maps.google.com'
  }
]

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  service: '',
  budget: '',
  message: ''
})

const isSubmitting = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', form.value)
    
    // Reset form
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      service: '',
      budget: '',
      message: ''
    }
    
    alert('Thank you! We\'ll be in touch within 24 hours.')
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('There was an error sending your message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>