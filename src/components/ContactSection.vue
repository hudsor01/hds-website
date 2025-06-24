<template>
  <section id="contact" class="py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div 
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-16"
      >
        <h2 class="text-4xl md:text-5xl font-bold font-roboto-flex text-slate-50 mb-6">
          Get In <span class="text-brand-cyan">Touch</span>
        </h2>
        <p class="text-xl text-slate-300 max-w-2xl mx-auto">
          Ready to start your project? Let's discuss how we can help bring your vision to life.
        </p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div 
          v-motion
          :initial="{ opacity: 0, x: -50 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 600, delay: 200 } }"
        >
          <div class="space-y-8">
            <div 
              v-for="(contact, index) in contactInfo" 
              :key="contact.title"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{ 
                opacity: 1, 
                y: 0, 
                transition: { 
                  duration: 500, 
                  delay: 300 + (index * 150) 
                } 
              }"
              class="flex items-start"
            >
              <component 
                :is="contact.icon" 
                class="h-6 w-6 text-brand-cyan mr-4 mt-1 flex-shrink-0" 
              />
              <div>
                <h3 class="text-lg font-semibold text-slate-50 mb-2">{{ contact.title }}</h3>
                <p class="text-slate-300">{{ contact.description }}</p>
                <a 
                  :href="contact.link" 
                  class="text-brand-cyan hover:text-brand-blue transition-colors duration-300"
                >
                  {{ contact.value }}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          v-motion
          :initial="{ opacity: 0, x: 50 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 600, delay: 400 } }"
        >
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  v-model="form.firstName"
                  required
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all duration-300"
                  placeholder="John"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  v-model="form.lastName"
                  required
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all duration-300"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                v-model="form.email"
                required
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all duration-300"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label for="service" class="block text-sm font-medium text-slate-300 mb-2">
                Service Interest
              </label>
              <select
                id="service"
                v-model="form.service"
                required
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all duration-300"
              >
                <option value="">Select a service</option>
                <option value="web-app">Web App Development</option>
                <option value="website">Website Solutions</option>
                <option value="strategy">Digital Strategy</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label for="message" class="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="5"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Tell us about your project..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-brand-cyan text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-blue transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const contactInfo = [
  {
    icon: EnvelopeIcon,
    title: 'Email',
    description: 'Send us an email anytime',
    value: 'hello@hudsondigital.com',
    link: 'mailto:hello@hudsondigital.com',
  },
  {
    icon: PhoneIcon,
    title: 'Phone',
    description: 'Call us during business hours',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567',
  },
  {
    icon: MapPinIcon,
    title: 'Location',
    description: 'Based in Dallas, TX',
    value: 'Dallas, Texas',
    link: '#',
  },
]

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  service: '',
  message: '',
})

const isSubmitting = ref(false)

const submitForm = async () => {
  isSubmitting.value = true

  // Simulate form submission
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Here you would typically send the form data to your backend
    console.log('Form submitted:', form.value)

    // Reset form
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      service: '',
      message: '',
    }

    alert('Thank you! Your message has been sent.')
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('There was an error sending your message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>