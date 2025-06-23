<template>
  <div>
    <!-- Header - Dark Tech -->
    <section class="relative bg-gradient-hero py-24 overflow-hidden">
      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
      </div>
      
      <!-- Dynamic Energy Elements -->
      <div class="absolute top-20 right-20 w-64 h-64 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div class="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <n-tag 
          size="large"
          style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3); color: #22d3ee; font-weight: 600; margin-bottom: 32px;"
        >
          <template #icon>
            <div class="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></div>
          </template>
          Our Story
        </n-tag>
        <h1 class="text-5xl font-black text-white mb-6">
          Forged in 
          <span class="text-gradient-neon glow-cyan">Excellence</span>
        </h1>
        <p class="text-xl text-gray-300">
          Crafting digital solutions with the precision of master engineers.
        </p>
      </div>
    </section>

    <!-- Story Section -->
    <section class="relative py-24 bg-gradient-primary overflow-hidden">
      <!-- Subtle tech pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Story Content -->
          <n-card 
            class="glass-morphism hover:shadow-xl hover:shadow-secondary-400/30 transition-all duration-500"
            style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(34, 211, 238, 0.2);"
            :bordered="false"
          >
            <div class="p-12">
              <h2 class="text-3xl font-black text-white mb-6 glow-cyan">Built from Experience</h2>
              <div class="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Hudson Digital was forged in the fires of enterprise-level challenges. With a foundation built on 
                  <strong class="text-secondary-400 glow-cyan">$3.7M+ in revenue impact</strong>, we don't just build websites—we engineer 
                  business transformation tools.
                </p>
                <p>
                  Our approach combines the precision of revenue operations with the craftsmanship of modern development. 
                  Every line of code, every design decision, every optimization is driven by one goal: 
                  <strong class="text-accent-400 glow-green">measurable business results</strong>.
                </p>
                <p>
                  We're not another agency promising the world. We're engineers who've proven that technology, 
                  when properly applied, can generate <strong class="text-warning-400 glow-orange">340% ROI</strong> and transform businesses.
                </p>
              </div>
            </div>
          </n-card>
          
          <!-- Mission & Vision Cards -->
          <n-space vertical size="large">
            <n-card 
              class="glass-morphism hover:shadow-xl hover:shadow-secondary-400/30 hover:-translate-y-2 transition-all duration-500"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(34, 211, 238, 0.2);"
              :bordered="false"
            >
              <div class="p-8">
                <n-space align="center" class="mb-6">
                  <n-avatar 
                    :size="64"
                    style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%);"
                    class="shadow-lg shadow-secondary-400/50 glow-cyan"
                  >
                    <n-icon size="32" color="white">
                      <RocketLaunchIcon />
                    </n-icon>
                  </n-avatar>
                  <h3 class="text-xl font-black text-white">Our Mission</h3>
                </n-space>
                <p class="text-gray-300">
                  To forge digital solutions that don't just work—they dominate. We engineer competitive advantages, 
                  not just websites.
                </p>
              </div>
            </n-card>
            
            <n-card 
              class="glass-morphism hover:shadow-xl hover:shadow-accent-400/30 hover:-translate-y-2 transition-all duration-500"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(74, 222, 128, 0.2);"
              :bordered="false"
            >
              <div class="p-8">
                <n-space align="center" class="mb-6">
                  <n-avatar 
                    :size="64"
                    style="background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);"
                    class="shadow-lg shadow-accent-400/50 glow-green"
                  >
                    <n-icon size="32" color="white">
                      <EyeIcon />
                    </n-icon>
                  </n-avatar>
                  <h3 class="text-xl font-black text-white">Our Vision</h3>
                </n-space>
                <p class="text-gray-300">
                  To be the premier digital forge where ambitious businesses come to build their market dominance.
                </p>
              </div>
            </n-card>
          </n-space>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="relative py-24 bg-gradient-hero overflow-hidden">
      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-white mb-4 glow-cyan">Core Principles</h2>
          <p class="text-xl text-gray-300">
            The foundational elements that drive our engineering excellence.
          </p>
        </div>
        
        <n-grid cols="1 m:3" x-gap="24" y-gap="24" responsive="screen">
          <n-grid-item>
            <n-card 
              hoverable
              class="h-full glass-morphism hover:shadow-xl hover:shadow-secondary-400/30 hover:-translate-y-2 transition-all duration-500"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(34, 211, 238, 0.2);"
              :bordered="false"
            >
              <div class="p-8 text-center">
                <div class="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary-400/50 glow-cyan">
                  <n-icon size="32" color="white">
                    <LightBulbIcon />
                  </n-icon>
                </div>
                <h3 class="text-2xl font-black text-white mb-4">Precision</h3>
                <p class="text-gray-300">
                  Every solution engineered with surgical precision to deliver exact business outcomes.
                </p>
              </div>
            </n-card>
          </n-grid-item>
          
          <n-grid-item>
            <n-card 
              hoverable
              class="h-full glass-morphism hover:shadow-xl hover:shadow-accent-400/30 hover:-translate-y-2 transition-all duration-500"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(74, 222, 128, 0.2);"
              :bordered="false"
            >
              <div class="p-8 text-center">
                <div class="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-400/50 glow-green">
                  <n-icon size="32" color="white">
                    <ShieldCheckIcon />
                  </n-icon>
                </div>
                <h3 class="text-2xl font-black text-white mb-4">Durability</h3>
                <p class="text-gray-300">
                  Built to last and scale. Our solutions withstand the test of growth and market evolution.
                </p>
              </div>
            </n-card>
          </n-grid-item>
          
          <n-grid-item>
            <n-card 
              hoverable
              class="h-full glass-morphism hover:shadow-xl hover:shadow-purple-400/30 hover:-translate-y-2 transition-all duration-500"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(192, 132, 252, 0.2);"
              :bordered="false"
            >
              <div class="p-8 text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-400/50">
                  <n-icon size="32" color="white">
                    <UsersIcon />
                  </n-icon>
                </div>
                <h3 class="text-2xl font-black text-white mb-4">Partnership</h3>
                <p class="text-gray-300">
                  We forge lasting alliances with clients who demand excellence and measurable results.
                </p>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </section>

    <!-- Founder Section -->
    <section class="relative py-24 bg-gradient-primary overflow-hidden">
      <!-- Subtle tech pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-white mb-4 glow-cyan">The Engineer</h2>
          <p class="text-xl text-gray-300">
            The master craftsman behind the forge.
          </p>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Founder Card -->
          <n-card 
            class="glass-morphism hover:shadow-xl hover:shadow-secondary-400/30 transition-all duration-500"
            style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(34, 211, 238, 0.2);"
            :bordered="false"
          >
            <div class="p-8">
              <n-space align="start" size="large">
                <n-avatar 
                  :size="96"
                  style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%);"
                  class="shadow-xl shadow-secondary-400/50 glow-cyan font-black text-white text-3xl"
                >
                  RH
                </n-avatar>
                <div class="flex-1">
                  <h3 class="text-2xl font-black text-white mb-2">Richard Hudson Jr.</h3>
                  <div class="text-secondary-400 font-bold mb-4 glow-cyan">Master Engineer & Founder</div>
                  <p class="text-gray-300 mb-6 leading-relaxed">
                    Revenue operations expert who has forged <strong class="text-secondary-400 glow-cyan">$3.7M+</strong> in measurable business impact. 
                    Combines deep technical expertise with proven business acumen to build solutions that don't just work—they dominate markets.
                  </p>
                  <n-space wrap size="small">
                    <n-tag size="small" style="background: rgba(34, 211, 238, 0.2); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3);">Revenue Engineering</n-tag>
                    <n-tag size="small" style="background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3);">Data Architecture</n-tag>
                    <n-tag size="small" style="background: rgba(192, 132, 252, 0.2); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3);">Business Intelligence</n-tag>
                    <n-tag size="small" style="background: rgba(251, 146, 60, 0.2); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3);">Full-Stack Development</n-tag>
                  </n-space>
                </div>
              </n-space>
            </div>
          </n-card>
          
          <!-- Achievements -->
          <n-space vertical size="large">
            <n-card 
              class="glass-morphism hover:shadow-xl hover:shadow-accent-400/30 transition-all duration-300"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(74, 222, 128, 0.2);"
              :bordered="false"
            >
              <div class="p-6">
                <n-space align="center" class="mb-4">
                  <n-avatar 
                    :size="48"
                    style="background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);"
                    class="shadow-lg shadow-accent-400/50 glow-green"
                  >
                    <n-icon size="24" color="white">
                      <ArrowTrendingUpIcon />
                    </n-icon>
                  </n-avatar>
                  <h4 class="text-lg font-black text-white">Revenue Impact</h4>
                </n-space>
                <p class="text-gray-300">$3.7M+ in measurable business transformation through data-driven solutions.</p>
              </div>
            </n-card>
            
            <n-card 
              class="glass-morphism hover:shadow-xl hover:shadow-purple-400/30 transition-all duration-300"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(192, 132, 252, 0.2);"
              :bordered="false"
            >
              <div class="p-6">
                <n-space align="center" class="mb-4">
                  <n-avatar 
                    :size="48"
                    style="background: linear-gradient(135deg, #c084fc 0%, #7c3aed 100%);"
                    class="shadow-lg shadow-purple-400/50"
                  >
                    <n-icon size="24" color="white">
                      <ChartBarIcon />
                    </n-icon>
                  </n-avatar>
                  <h4 class="text-lg font-black text-white">Precision Engineering</h4>
                </n-space>
                <p class="text-gray-300">96.8% forecast accuracy with enterprise-grade analytics and optimization.</p>
              </div>
            </n-card>
            
            <n-card 
              class="glass-morphism hover:shadow-xl hover:shadow-warning-400/30 transition-all duration-300"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(251, 146, 60, 0.2);"
              :bordered="false"
            >
              <div class="p-6">
                <n-space align="center" class="mb-4">
                  <n-avatar 
                    :size="48"
                    style="background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);"
                    class="shadow-lg shadow-warning-400/50 glow-orange"
                  >
                    <n-icon size="24" color="white">
                      <FireIcon />
                    </n-icon>
                  </n-avatar>
                  <h4 class="text-lg font-black text-white">ROI Mastery</h4>
                </n-space>
                <p class="text-gray-300">340% average ROI through strategic digital transformation consulting.</p>
              </div>
            </n-card>
          </n-space>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-24 bg-gradient-hero overflow-hidden">
      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
      </div>
      
      <!-- Dynamic Energy Elements -->
      <div class="absolute top-20 right-16 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div class="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <h2 class="text-4xl font-black text-white mb-6 glow-cyan">
          Ready to Build Something Legendary?
        </h2>
        <p class="text-xl text-gray-300 mb-10">
          Let's forge your digital dominance together.
        </p>
        <n-button 
          size="large"
          strong
          style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); border: none; padding: 20px 40px; font-size: 20px; height: auto; box-shadow: 0 4px 16px rgba(34, 211, 238, 0.2);"
          @click="$router.push('/contact')"
          class="hover:scale-105 transition-all duration-300 glow-cyan"
        >
          <template #icon>
            <n-icon>
              <ArrowRightIcon />
            </n-icon>
          </template>
          Start Forging
        </n-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  LightBulbIcon, 
  ShieldCheckIcon, 
  UsersIcon,
  RocketLaunchIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  FireIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'
</script>