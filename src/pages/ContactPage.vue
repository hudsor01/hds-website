<template>
  <div class="min-h-screen bg-gradient-hero">
    <!-- Power Grid Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
    </div>

    <!-- Dynamic Energy Elements -->
    <div class="absolute top-20 right-16 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

    <!-- Header -->
    <section class="relative py-16">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <div class="flex justify-center mb-8">
        </div>
        <h1 class="text-5xl font-black text-white mb-6 glow-cyan">Let's Build Something Legendary</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          Ready to dominate your market? Tell us about your vision and let's engineer a solution that crushes the competition.
        </p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="relative py-12">
      <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Contact Form - Takes 2 columns -->
          <div class="lg:col-span-2">
            <n-card 
              class="shadow-2xl hover:shadow-secondary-500/30 transition-all duration-500 glass-morphism"
              style="background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(34, 211, 238, 0.3);"
              :bordered="false"
            >
              <div class="p-8">
                <div class="flex items-center gap-3 mb-8">
                  <div class="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center glow-cyan">
                    <n-icon size="24" color="white">
                      <RocketLaunchIcon />
                    </n-icon>
                  </div>
                  <div>
                    <h2 class="text-2xl font-black text-white glow-cyan">Launch Your Project</h2>
                    <p class="text-gray-400">Complete this form and we'll respond within 4 hours.</p>
                  </div>
                </div>
                
                <n-form
                  ref="formRef"
                  :model="form"
                  :rules="rules"
                  size="large"
                  label-placement="top"
                  class="space-y-6"
                >
                  <!-- Personal Info -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <n-form-item label="First Name" path="firstName" class="form-item-dark">
                      <n-input 
                        v-model:value="form.firstName"
                        placeholder="John"
                        class="input-dark"
                        :input-props="{ 
                          style: 'background: rgba(255,255,255,0.05); border: 1px solid rgba(34,211,238,0.2); color: white; border-radius: 12px;'
                        }"
                      />
                    </n-form-item>
                    <n-form-item label="Last Name" path="lastName" class="form-item-dark">
                      <n-input 
                        v-model:value="form.lastName"
                        placeholder="Doe"
                        class="input-dark"
                        :input-props="{ 
                          style: 'background: rgba(255,255,255,0.05); border: 1px solid rgba(34,211,238,0.2); color: white; border-radius: 12px;'
                        }"
                      />
                    </n-form-item>
                  </div>
                  
                  <!-- Contact Info -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <n-form-item label="Email Address" path="email" class="form-item-dark">
                      <n-input 
                        v-model:value="form.email"
                        type="email"
                        placeholder="john@company.com"
                        class="input-dark"
                        :input-props="{ 
                          style: 'background: rgba(255,255,255,0.05); border: 1px solid rgba(34,211,238,0.2); color: white; border-radius: 12px;'
                        }"
                      />
                    </n-form-item>
                    <n-form-item label="Phone Number" path="phone" class="form-item-dark">
                      <n-input 
                        v-model:value="form.phone"
                        placeholder="+1 (555) 123-4567"
                        class="input-dark"
                        :input-props="{ 
                          style: 'background: rgba(255,255,255,0.05); border: 1px solid rgba(34,211,238,0.2); color: white; border-radius: 12px;'
                        }"
                      />
                    </n-form-item>
                  </div>

                  <!-- Company Info -->
                  <n-form-item label="Company Name" path="company" class="form-item-dark">
                    <n-input 
                      v-model:value="form.company"
                      placeholder="Your Company"
                      class="input-dark"
                      :input-props="{ 
                        style: 'background: rgba(255,255,255,0.05); border: 1px solid rgba(34,211,238,0.2); color: white; border-radius: 12px;'
                      }"
                    />
                  </n-form-item>
                  
                  <!-- Project Details -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <n-form-item label="Service Needed" path="service" class="form-item-dark">
                      <n-select
                        v-model:value="form.service"
                        placeholder="Select service type"
                        :options="serviceOptions"
                        :render-label="renderServiceLabel"
                        class="select-dark"
                        style="background: rgba(255,255,255,0.05); border-radius: 12px;"
                      />
                    </n-form-item>
                    <n-form-item label="Project Budget" path="budget" class="form-item-dark">
                      <n-select
                        v-model:value="form.budget"
                        placeholder="Select budget range"
                        :options="budgetOptions"
                        class="select-dark"
                        style="background: rgba(255,255,255,0.05); border-radius: 12px;"
                      />
                    </n-form-item>
                  </div>

                  <!-- Timeline -->
                  <n-form-item label="Project Timeline" path="timeline" class="form-item-dark">
                    <n-select
                      v-model:value="form.timeline"
                      placeholder="When do you need this completed?"
                      :options="timelineOptions"
                      class="select-dark"
                      style="background: rgba(255,255,255,0.05); border-radius: 12px;"
                    />
                  </n-form-item>
                  
                  <!-- Project Description -->
                  <n-form-item label="Project Details" path="message" class="form-item-dark">
                    <n-input 
                      v-model:value="form.message"
                      type="textarea"
                      placeholder="Tell us about your project goals, requirements, and any specific features you need..."
                      :rows="5"
                      class="input-dark"
                      :input-props="{ 
                        style: 'background: rgba(255,255,255,0.05); border: 1px solid rgba(34,211,238,0.2); color: white; border-radius: 12px; resize: vertical;'
                      }"
                    />
                  </n-form-item>
                  
                  <!-- Submit Button -->
                  <div class="pt-4">
                    <n-button
                      type="primary"
                      size="large"
                      block
                      strong
                      :loading="isSubmitting"
                      @click="submitForm"
                      :disabled="isSubmitting"
                      style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); border: none; height: 60px; font-size: 18px; font-weight: 700; border-radius: 16px; box-shadow: 0 8px 32px rgba(34, 211, 238, 0.3);"
                      class="hover:scale-[1.02] hover:shadow-2xl hover:shadow-secondary-400/40 transition-all duration-300 glow-cyan"
                    >
                      <template #icon>
                        <n-icon size="20">
                          <RocketLaunchIcon v-if="!isSubmitting" />
                          <div v-else class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        </n-icon>
                      </template>
                      {{ isSubmitting ? 'Launching Your Project...' : 'Launch Project' }}
                    </n-button>
                  </div>

                  <!-- Trust Indicators -->
                  <div class="flex items-center justify-center gap-6 pt-6 border-t border-gray-700/50">
                    <div class="flex items-center gap-2 text-gray-400">
                      <n-icon size="16" color="#4ade80">
                        <CheckCircleIcon />
                      </n-icon>
                      <span class="text-sm">Response within 4 hours</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-400">
                      <n-icon size="16" color="#4ade80">
                        <ShieldCheckIcon />
                      </n-icon>
                      <span class="text-sm">100% Confidential</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-400">
                      <n-icon size="16" color="#4ade80">
                        <StarIcon />
                      </n-icon>
                      <span class="text-sm">5-Star Service</span>
                    </div>
                  </div>
                </n-form>
              </div>
            </n-card>
          </div>
          
          <!-- Contact Info Sidebar -->
          <div class="lg:col-span-1">
            <div class="space-y-6">
              <!-- Quick Contact -->
              <n-card 
                class="shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-2 transition-all duration-500 glass-morphism"
                style="background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(34, 211, 238, 0.2);"
                :bordered="false"
              >
                <div class="p-6">
                  <div class="flex items-center gap-3 mb-6">
                    <n-icon size="24" color="#22d3ee" class="glow-cyan">
                      <ChatBubbleLeftRightIcon />
                    </n-icon>
                    <h3 class="text-lg font-black text-white glow-cyan">Quick Contact</h3>
                  </div>
                  
                  <div class="space-y-4">
                    <a 
                      href="mailto:hello@hudsondigitalsolutions.com"
                      target="_blank"
                      class="flex items-center gap-3 p-4 glass-light rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div class="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform glow-cyan">
                        <n-icon size="24" color="white">
                          <EnvelopeIcon />
                        </n-icon>
                      </div>
                      <div>
                        <p class="text-white font-semibold">Email Us</p>
                      </div>
                    </a>
                    
                    <a 
                      href="https://github.com/hudsor01"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-3 p-4 glass-light rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div class="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <n-icon size="24" color="white">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </n-icon>
                      </div>
                      <div>
                        <p class="text-white font-semibold">GitHub</p>
                      </div>
                    </a>
                  </div>
                </div>
              </n-card>

              <!-- Response Time -->
              <n-card 
                class="shadow-lg hover:shadow-accent-500/30 hover:-translate-y-2 transition-all duration-500 glass-morphism"
                style="background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(74, 222, 128, 0.2);"
                :bordered="false"
              >
                <div class="p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <n-icon size="24" color="#4ade80" class="glow-green">
                      <ClockIcon />
                    </n-icon>
                    <h3 class="text-lg font-black text-white glow-green">Response Time</h3>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-black text-accent-400 glow-green mb-2">&lt; 4 Hours</div>
                    <p class="text-gray-300 text-sm">Average response time</p>
                  </div>
                </div>
              </n-card>

              <!-- Success Rate -->
              <n-card 
                class="shadow-lg hover:shadow-warning-500/30 hover:-translate-y-2 transition-all duration-500 glass-morphism"
                style="background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(251, 146, 60, 0.2);"
                :bordered="false"
              >
                <div class="p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <n-icon size="24" color="#fb923c" class="glow-orange">
                      <ChartBarIcon />
                    </n-icon>
                    <h3 class="text-lg font-black text-white glow-orange">Success Rate</h3>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-black text-warning-400 glow-orange mb-2">98.9%</div>
                    <p class="text-gray-300 text-sm">Project success rate</p>
                  </div>
                </div>
              </n-card>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { useMessage, createDiscreteApi } from 'naive-ui'
import { 
  EnvelopeIcon, 
  RocketLaunchIcon,
  ClockIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  EllipsisHorizontalIcon
} from '@heroicons/vue/24/outline'

// Try to use the context message, fallback to discrete API if needed
let message: ReturnType<typeof useMessage>
try {
  message = useMessage()
} catch (error) {
  const { message: discreteMessage } = createDiscreteApi(['message'])
  message = discreteMessage
}

const serviceOptions = [
  { 
    label: 'Web Application Development', 
    value: 'web-development',
    icon: () => h(CodeBracketIcon)
  },
  { 
    label: 'Mobile App Development', 
    value: 'mobile-app',
    icon: () => h(DevicePhoneMobileIcon)
  },
  { 
    label: 'Custom Software Solutions', 
    value: 'custom-software',
    icon: () => h(CogIcon)
  },
  { 
    label: 'Digital Strategy & Consulting', 
    value: 'consulting',
    icon: () => h(ChartBarIcon)
  },
  { 
    label: 'Other / Not Sure', 
    value: 'other',
    icon: () => h(EllipsisHorizontalIcon)
  }
]

const budgetOptions = [
  { label: '$5,000 - $10,000', value: '5k-10k' },
  { label: '$10,000 - $25,000', value: '10k-25k' },
  { label: '$25,000 - $50,000', value: '25k-50k' },
  { label: '$50,000 - $100,000', value: '50k-100k' },
  { label: '$100,000+', value: '100k+' },
  { label: 'Not sure yet', value: 'unsure' }
]

const timelineOptions = [
  { label: 'ASAP (Rush Project)', value: 'asap' },
  { label: '1-2 Months', value: '1-2-months' },
  { label: '3-6 Months', value: '3-6-months' },
  { label: '6+ Months', value: '6-months-plus' },
  { label: 'Just exploring options', value: 'exploring' }
]

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  budget: '',
  timeline: '',
  message: ''
})

const formRef = ref()
const isSubmitting = ref(false)

const rules = {
  firstName: {
    required: true,
    message: 'Please enter your first name',
    trigger: ['input', 'blur']
  },
  lastName: {
    required: true,
    message: 'Please enter your last name',
    trigger: ['input', 'blur']
  },
  email: [
    {
      required: true,
      message: 'Please enter your email',
      trigger: ['input', 'blur']
    },
    {
      type: 'email',
      message: 'Please enter a valid email',
      trigger: ['input', 'blur']
    }
  ],
  service: {
    required: true,
    message: 'Please select a service',
    trigger: ['change', 'blur']
  },
  message: [
    {
      required: true,
      message: 'Please describe your project',
      trigger: ['input', 'blur']
    },
    {
      min: 10,
      message: 'Please provide more details (minimum 10 characters)',
      trigger: ['input', 'blur']
    }
  ]
}

const renderServiceLabel = (option: any) => {
  return h('span', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
    option.icon?.(),
    option.label
  ])
}

const submitForm = async () => {
  try {
    await formRef.value?.validate()
    isSubmitting.value = true
    
    // Create mailto link with form data
    const emailBody = `
New Project Inquiry from Hudson Digital Solutions Website

Contact Information:
- Name: ${form.value.firstName} ${form.value.lastName}
- Email: ${form.value.email}
- Phone: ${form.value.phone || 'Not provided'}
- Company: ${form.value.company || 'Not provided'}

Project Details:
- Service: ${serviceOptions.find(s => s.value === form.value.service)?.label || form.value.service}
- Budget: ${budgetOptions.find(b => b.value === form.value.budget)?.label || form.value.budget}
- Timeline: ${timelineOptions.find(t => t.value === form.value.timeline)?.label || form.value.timeline}

Message:
${form.value.message}

---
Submitted from: Hudson Digital Solutions Contact Form
Time: ${new Date().toLocaleString()}
    `.trim()

    // Create and trigger mailto link
    const mailtoLink = `mailto:hello@hudsondigitalsolutions.com?subject=New Project Inquiry - ${form.value.firstName} ${form.value.lastName}&body=${encodeURIComponent(emailBody)}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Show success message
    message.success('Email client opened! Please send the email to complete your inquiry.', {
      duration: 6000
    })
    
    // Reset form after a delay
    setTimeout(() => {
      form.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        budget: '',
        timeline: '',
        message: ''
      }
    }, 2000)
    
  } catch (error) {
    console.error('Error submitting form:', error)
    message.error('Please check all required fields and try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Custom dark theme styling for form inputs */
:deep(.n-form-item-label) {
  color: #e5e7eb !important;
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.n-input__input-el) {
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid rgba(34,211,238,0.2) !important;
  color: white !important;
}

:deep(.n-input__input-el:focus) {
  border-color: #22d3ee !important;
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.1) !important;
}

:deep(.n-input__input-el::placeholder) {
  color: rgba(156, 163, 175, 0.8) !important;
}

:deep(.n-base-selection) {
  background: rgba(9, 9, 11, 0.8) !important;
  border: 1px solid rgba(34,211,238,0.2) !important;
  backdrop-filter: blur(8px) !important;
}

:deep(.n-base-selection:focus) {
  border-color: #22d3ee !important;
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.1) !important;
  background: rgba(9, 9, 11, 0.9) !important;
}

:deep(.n-base-selection-label) {
  color: white !important;
}

:deep(.n-base-selection-placeholder) {
  color: rgba(156, 163, 175, 1) !important;
  font-weight: 400 !important;
}

/* Dropdown menu container */
:deep(.n-base-select-menu) {
  background: rgba(9, 9, 11, 0.98) !important;
  border: 1px solid rgba(34,211,238,0.3) !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8) !important;
  border-radius: 12px !important;
}

/* Individual dropdown options */
:deep(.n-base-select-option) {
  color: white !important;
  background: rgba(9, 9, 11, 0.95) !important;
  transition: all 0.2s ease !important;
  padding: 12px 16px !important;
  margin: 2px 4px !important;
  border-radius: 8px !important;
}

/* Hover state for options - Multiple selectors for maximum specificity */
:deep(.n-base-select-option:hover),
:deep(.n-base-select-option.n-base-select-option--hovered),
:deep(.n-base-select-option--hovered),
:deep(.n-select-option:hover),
:deep(.n-select-option.n-select-option--hovered) {
  background: #000000 !important;
  background-color: #000000 !important;
  color: #22d3ee !important;
  border: 1px solid rgba(34, 211, 238, 0.8) !important;
  box-shadow: 0 4px 16px rgba(34, 211, 238, 0.4) !important;
  transform: translateX(2px) !important;
}

/* Force black background on all possible hover states */
:deep(.n-base-select-menu .n-base-select-option:hover),
:deep(.n-base-select-menu .n-base-select-option.n-base-select-option--hovered) {
  background: #000000 !important;
  background-color: #000000 !important;
}

/* Active/focused state for dropdown base selection */
:deep(.n-base-selection--active) {
  background: rgba(0, 0, 0, 0.9) !important;
  border-color: #22d3ee !important;
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.3) !important;
}

/* Ensure dropdown stays open with proper dark background */
:deep(.n-base-selection--opened) {
  background: rgba(0, 0, 0, 0.95) !important;
  border-color: #22d3ee !important;
}

:deep(.n-form-item-feedback__line) {
  color: #ef4444 !important;
}

/* Comprehensive black hover override - catch all cases */
:deep(.n-base-select-menu .n-base-select-option-body:hover),
:deep(.n-base-select-menu .n-base-select-option-body.n-base-select-option-body--hovered),
:deep(.n-select-option:hover),
:deep(.n-select-option.n-select-option--hovered) {
  background: #000000 !important;
  background-color: #000000 !important;
  color: #22d3ee !important;
  border: 1px solid rgba(34, 211, 238, 0.8) !important;
  box-shadow: 0 4px 16px rgba(34, 211, 238, 0.4) !important;
}

/* Nuclear option - force black on ANY hover in dropdown */
:deep(.n-base-select-menu) {
  --n-option-color-hover: #000000 !important;
  --n-option-color-active: #000000 !important;
}

:deep(.n-base-select-menu *:hover),
:deep(.n-base-select-menu div:hover) {
  background: #000000 !important;
  background-color: #000000 !important;
}
</style>