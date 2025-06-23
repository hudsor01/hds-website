<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <section class="bg-white py-24">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200">
            <img src="/HDS-Logo.jpeg" alt="Hudson Digital" class="h-10 w-auto" />
            <div class="text-left">
              <div class="text-sm font-medium text-primary-700">About Us</div>
              <div class="text-lg font-bold text-primary-900">Our Story</div>
            </div>
          </div>
        </div>
        <h1 class="text-5xl font-bold text-gray-900 mb-6">Meet Hudson Digital</h1>
        <p class="text-xl text-gray-600">
          Passionate developers and designers creating exceptional digital experiences.
        </p>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Story Content -->
          <div class="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div class="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Founded with a mission to help businesses succeed in the digital age, Hudson Digital Solutions 
                has been creating innovative web solutions that drive real results. We believe that great 
                technology should be accessible to businesses of all sizes.
              </p>
              <p>
                Our team combines technical expertise with creative vision to deliver solutions that not only 
                look great but also perform exceptionally well. We stay at the forefront of technology trends 
                to ensure our clients always have a competitive advantage.
              </p>
              <p>
                Whether you're a startup looking to establish your online presence or an established business 
                ready to scale, we have the experience and passion to help you achieve your goals.
              </p>
            </div>
          </div>
          
          <!-- Mission & Vision Cards -->
          <div class="space-y-8">
            <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p class="text-gray-600">
                To empower businesses with cutting-edge digital solutions that drive growth, enhance user experiences, and create lasting value.
              </p>
            </div>
            
            <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p class="text-gray-600">
                To be the leading digital partner for businesses seeking innovative, scalable, and results-driven web solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p class="text-xl text-gray-600">
            These principles guide everything we do.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LightBulbIcon class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p class="text-gray-600">
              We embrace new technologies and creative solutions to solve complex problems.
            </p>
          </div>
          
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Quality</h3>
            <p class="text-gray-600">
              Every project receives our full attention to detail and commitment to excellence.
            </p>
          </div>
          
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UsersIcon class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Partnership</h3>
            <p class="text-gray-600">
              We build lasting relationships with our clients based on trust and mutual success.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Meet the Team</h2>
          <p class="text-xl text-gray-600">
            The experienced professionals behind Hudson Digital Solutions.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <!-- Team Member -->
          <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex items-start gap-6">
              <div class="w-24 h-24 bg-primary-100 rounded-2xl flex items-center justify-center">
                <svg class="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Richard Hudson Jr.</h3>
                <div class="text-primary-600 font-medium mb-4">Founder & Lead Developer</div>
                <p class="text-gray-600 mb-4 leading-relaxed">
                  Revenue operations expert with a proven track record of driving $3.7M+ in revenue impact. 
                  Specializes in data analytics, process optimization, and building scalable web solutions 
                  that deliver measurable business results.
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Revenue Operations</span>
                  <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Data Analytics</span>
                  <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Web Development</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Expertise Areas -->
          <div class="space-y-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900">Revenue Analytics</h4>
              </div>
              <p class="text-gray-600">Advanced data analytics and revenue optimization with 96.8% forecast accuracy.</p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900">Full-Stack Development</h4>
              </div>
              <p class="text-gray-600">Modern web applications using Vue.js, React, Next.js, and Python backends.</p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900">Business Growth</h4>
              </div>
              <p class="text-gray-600">Strategic consulting delivering 340% ROI and measurable business transformation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievements Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
          <p class="text-xl text-gray-600">
            Milestones that reflect our commitment to excellence and client success.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">$3.7M+ Revenue Impact</h3>
            <p class="text-gray-600">Generated measurable revenue growth through data-driven optimization strategies.</p>
          </div>
          
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Industry Recognition</h3>
            <p class="text-gray-600">96.8% forecast accuracy and 340% ROI benchmarks recognized by industry peers.</p>
          </div>
          
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Rapid Innovation</h3>
            <p class="text-gray-600">25+ projects delivered with cutting-edge technology and measurable outcomes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to work together?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Let's discuss your project and see how we can help bring your vision to life.
        </p>
        <router-link 
          to="/contact"
          class="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg"
        >
          Get in Touch
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  LightBulbIcon, 
  ShieldCheckIcon, 
  UsersIcon 
} from '@heroicons/vue/24/outline'
</script>