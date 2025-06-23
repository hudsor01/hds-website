<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-100/20 to-transparent rounded-full"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
          <!-- Content -->
          <div class="animate-fade-in-up">
            <!-- Badge -->
            <div class="mb-10">
              <div class="inline-flex items-center gap-4 p-4 glass-morphism rounded-2xl shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
                <div class="relative">
                  <img 
                    src="/HDS-Logo.jpeg" 
                    alt="Hudson Digital Solutions" 
                    class="h-12 w-auto"
                  />
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm"></div>
                </div>
                <div class="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                <div class="text-left">
                  <div class="text-sm font-medium text-gray-600">Professional</div>
                  <div class="text-sm font-bold text-gray-900">Digital Solutions</div>
                </div>
              </div>
            </div>
            
            <!-- Main Heading -->
            <h1 class="font-display text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-none text-balance">
              We craft 
              <span class="relative inline-block">
                <span class="gradient-text">exceptional</span>
                <div class="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-lg"></div>
              </span>
              digital experiences
            </h1>
            
            <!-- Subtitle -->
            <p class="text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl text-balance">
              Transform your business with cutting-edge web solutions that drive growth, engagement, and success.
            </p>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-6">
              <router-link 
                to="/contact"
                class="group relative bg-gradient-to-r from-primary-600 to-blue-700 text-white px-10 py-5 rounded-2xl font-semibold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-center"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center justify-center gap-2">
                  Start Your Project
                  <ArrowRightIcon class="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </router-link>
              
              <router-link 
                to="/portfolio"
                class="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-900 px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all duration-300 text-center shadow-lg hover:shadow-xl"
              >
                <span class="flex items-center justify-center gap-2">
                  View Our Work
                  <EyeIcon class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </span>
              </router-link>
            </div>
            
            <!-- Trust Indicators -->
            <div class="mt-12 animate-fade-in-up animation-delay-400">
              <div class="flex items-center gap-8 text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>150+ Projects Delivered</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
                  <span>98% Client Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Visual Element -->
          <div class="relative animate-fade-in-up animation-delay-200">
            <!-- Main Browser Card -->
            <div class="perspective-1000">
              <div class="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100/50 hover:shadow-3xl hover:-translate-y-4 hover:rotate-1 transition-all duration-700 preserve-3d group">
                <!-- Browser Header -->
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-3 h-3 bg-red-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full group-hover:scale-125 transition-transform duration-300 animation-delay-100"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-300 animation-delay-200"></div>
                  <div class="ml-4 flex-1 h-6 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300"></div>
                </div>
                
                <!-- Content Mockup -->
                <div class="space-y-4">
                  <div class="h-8 bg-gradient-to-r from-primary-100 to-blue-100 rounded-lg animate-shimmer" style="background-size: 200% 100%;"></div>
                  <div class="h-4 bg-gray-100 rounded-lg w-4/5 group-hover:bg-gray-200 transition-colors duration-300"></div>
                  <div class="h-4 bg-gray-100 rounded-lg w-3/5 group-hover:bg-gray-200 transition-colors duration-300"></div>
                  <div class="mt-6 flex gap-3">
                    <div class="h-10 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg w-32 animate-glow"></div>
                    <div class="h-10 bg-gray-100 rounded-lg w-28 group-hover:bg-gray-200 transition-colors duration-300"></div>
                  </div>
                  
                  <!-- Stats Preview -->
                  <div class="mt-8 grid grid-cols-3 gap-4">
                    <div class="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors duration-300">
                      <div class="text-lg font-bold text-primary-600">150+</div>
                      <div class="text-xs text-gray-500">Projects</div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors duration-300">
                      <div class="text-lg font-bold text-green-600">98%</div>
                      <div class="text-xs text-gray-500">Success</div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors duration-300">
                      <div class="text-lg font-bold text-purple-600">5⭐</div>
                      <div class="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Floating Elements -->
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-200/60 to-purple-200/40 rounded-3xl opacity-60 shadow-lg animate-float animation-delay-0 blur-sm"></div>
            <div class="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-purple-200/40 to-pink-200/60 rounded-3xl opacity-50 shadow-lg animate-float animation-delay-1000 blur-sm"></div>
            
            <!-- Tech Stack Icons -->
            <div class="absolute -right-4 top-1/4 space-y-4 animate-fade-in animation-delay-600">
              <div class="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform duration-300">
                <div class="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div class="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform duration-300 animation-delay-200">
                <div class="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
              <div class="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform duration-300 animation-delay-400">
                <div class="w-6 h-6 bg-yellow-500 rounded-lg transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Preview -->
    <section class="py-32 bg-gradient-to-b from-white to-gray-50/50">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <!-- Section Header -->
        <div class="text-center mb-20 animate-fade-in-up">
          <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            Our Services
          </div>
          <h2 class="font-display text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
            What We <span class="gradient-text">Deliver</span>
          </h2>
          <p class="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto text-balance">
            Comprehensive digital solutions designed to elevate your business and drive meaningful results.
          </p>
        </div>
        
        <!-- Services Grid -->
        <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
          <!-- Web Development -->
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-white/80 backdrop-blur-sm text-center p-10 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in-up animation-delay-200">
              <!-- Icon -->
              <div class="relative mb-8">
                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <CodeBracketIcon class="h-10 w-10 text-white" />
                </div>
                <div class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              
              <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">Web Development</h3>
              <p class="text-gray-600 leading-relaxed mb-6">
                Custom websites and applications built with cutting-edge technologies for optimal performance and user experience.
              </p>
              
              <!-- Features -->
              <div class="space-y-2 text-sm text-gray-500">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Responsive Design</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Modern Frameworks</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>SEO Optimized</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Mobile Apps -->
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-white/80 backdrop-blur-sm text-center p-10 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in-up animation-delay-400">
              <!-- Icon -->
              <div class="relative mb-8">
                <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <DevicePhoneMobileIcon class="h-10 w-10 text-white" />
                </div>
                <div class="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              
              <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">Mobile Apps</h3>
              <p class="text-gray-600 leading-relaxed mb-6">
                Native and cross-platform mobile applications that deliver exceptional user experiences across all devices.
              </p>
              
              <!-- Features -->
              <div class="space-y-2 text-sm text-gray-500">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>iOS & Android</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Cross-Platform</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>App Store Ready</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Digital Strategy -->
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-white/80 backdrop-blur-sm text-center p-10 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in-up animation-delay-600">
              <!-- Icon -->
              <div class="relative mb-8">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <ChartBarIcon class="h-10 w-10 text-white" />
                </div>
                <div class="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              
              <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">Digital Strategy</h3>
              <p class="text-gray-600 leading-relaxed mb-6">
                Strategic consulting and planning to maximize your digital presence and achieve sustainable growth.
              </p>
              
              <!-- Features -->
              <div class="space-y-2 text-sm text-gray-500">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Growth Planning</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Market Analysis</span>
                </div>
                <div class="flex items-center justify-center gap-2">
                  <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>ROI Optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- CTA -->
        <div class="text-center mt-16 animate-fade-in-up animation-delay-800">
          <router-link 
            to="/services"
            class="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <span>Explore All Services</span>
            <ArrowRightIcon class="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what businesses are saying about working with Hudson Digital.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="flex text-yellow-400">
                <svg v-for="star in 5" :key="star" class="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
            <p class="text-gray-600 mb-6 italic">
              "Hudson Digital transformed our online presence completely. Our website traffic increased by 300% 
              and conversions are through the roof. Their team is professional, responsive, and truly understands business."
            </p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div class="font-semibold text-gray-900">Sarah Johnson</div>
                <div class="text-gray-600">CEO, TechStart Inc.</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="flex text-yellow-400">
                <svg v-for="star in 5" :key="star" class="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
            <p class="text-gray-600 mb-6 italic">
              "The mobile app they built for us exceeded all expectations. User engagement is up 250% and 
              the app store reviews are fantastic. Hudson Digital delivers on their promises."
            </p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div class="font-semibold text-gray-900">Michael Chen</div>
                <div class="text-gray-600">Founder, FitLife Pro</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="flex text-yellow-400">
                <svg v-for="star in 5" :key="star" class="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
            <p class="text-gray-600 mb-6 italic">
              "Working with Hudson Digital was a game-changer for our e-commerce business. Sales increased 
              by 180% in the first quarter alone. Their strategic approach to digital transformation is unmatched."
            </p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div class="font-semibold text-gray-900">Emily Rodriguez</div>
                <div class="text-gray-600">Director, Retail Plus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Proven Results</h2>
          <p class="text-xl text-gray-600">
            Numbers that showcase our commitment to delivering exceptional outcomes.
          </p>
        </div>
        
        <div class="grid md:grid-cols-4 gap-8">
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">150+</div>
            <div class="text-gray-600 font-medium">Projects Delivered</div>
            <div class="text-sm text-gray-500 mt-2">Since 2019</div>
          </div>
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">98%</div>
            <div class="text-gray-600 font-medium">Client Satisfaction</div>
            <div class="text-sm text-gray-500 mt-2">Average rating</div>
          </div>
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">250%</div>
            <div class="text-gray-600 font-medium">Average ROI</div>
            <div class="text-sm text-gray-500 mt-2">Client growth</div>
          </div>
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">24/7</div>
            <div class="text-gray-600 font-medium">Support Available</div>
            <div class="text-sm text-gray-500 mt-2">Always here for you</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to transform your digital presence?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Let's discuss how we can help your business grow with modern web solutions.
        </p>
        <router-link 
          to="/contact"
          class="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg"
        >
          Get Started Today
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  CodeBracketIcon, 
  DevicePhoneMobileIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
</script>