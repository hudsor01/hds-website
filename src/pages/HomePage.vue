<template>
  <div>
    <!-- Hero Section - Bold & Masculine -->
    <section class="relative min-h-screen bg-gradient-hero flex items-center overflow-hidden">
      <!-- Power Grid Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
      </div>
      
      <!-- Dynamic Energy Elements -->
      <div class="absolute top-20 right-16 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      <div class="absolute top-1/3 left-1/3 w-32 h-32 bg-secondary-400/10 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
      
      <div class="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Content -->
          <div>
            
            <h1 class="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
              BUILD.
              <br>
              <span class="text-gradient-neon glow-cyan">DEPLOY.</span>
              <br>
              <span class="text-secondary-400">DOMINATE.</span>
            </h1>
            
            <p class="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
              We engineer digital solutions that don't just work—they <strong class="text-white">crush the competition</strong>. 
              No fluff. No delays. Just results.
            </p>
            
            <n-space size="large" class="flex-wrap">
              <n-button 
                type="primary" 
                size="large"
                strong
                style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); border: none; padding: 16px 32px; font-size: 18px; height: auto; box-shadow: 0 4px 16px rgba(34, 211, 238, 0.2);"
                @click="$router.push('/contact')"
                class="hover:scale-105 transition-all duration-300 glow-cyan"
              >
                <template #icon>
                  <n-icon>
                    <RocketLaunchIcon />
                  </n-icon>
                </template>
                Launch Project
              </n-button>
              
              <n-button 
                quaternary
                size="large"
                style="color: white; padding: 16px 32px; font-size: 18px; height: auto; border: 2px solid #22d3ee; background: rgba(34, 211, 238, 0.1); backdrop-filter: blur(10px);"
                @click="$router.push('/portfolio')"
                class="hover:scale-105 transition-all duration-300 glass-light"
              >
                <template #icon>
                  <n-icon>
                    <EyeIcon />
                  </n-icon>
                </template>
                View Arsenal
              </n-button>
            </n-space>
            
            <!-- Power Metrics -->
            <div class="mt-16">
              <n-grid cols="3" x-gap="24" responsive="screen">
                <n-grid-item>
                  <div class="text-center">
                    <div class="text-3xl font-black text-accent-400 mb-1 glow-green">200+</div>
                    <div class="text-sm text-primary-300 uppercase tracking-wide font-semibold">Projects Deployed</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="text-center">
                    <div class="text-3xl font-black text-secondary-400 mb-1 glow-cyan">99.9%</div>
                    <div class="text-sm text-primary-300 uppercase tracking-wide font-semibold">Uptime Rate</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="text-center">
                    <div class="text-3xl font-black text-warning-400 mb-1 glow-orange">24/7</div>
                    <div class="text-sm text-primary-300 uppercase tracking-wide font-semibold">Battle Ready</div>
                  </div>
                </n-grid-item>
              </n-grid>
            </div>
          </div>
          
          <!-- Terminal Mockup -->
          <div class="relative">
            <n-card 
              class="shadow-2xl hover:shadow-secondary-500/30 transition-all duration-500 glass-morphism"
              style="background: rgba(9, 9, 11, 0.95); border: 1px solid rgba(34, 211, 238, 0.3);"
              :bordered="false"
            >
              <!-- Terminal Header -->
              <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                <n-space size="small">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                </n-space>
                <div class="text-gray-400 text-sm font-mono">hudson-deploy.sh</div>
              </div>
              
              <!-- Terminal Content -->
              <div class="font-mono text-sm space-y-2">
                <div class="text-accent-400">$ npm run deploy --production</div>
                <div class="text-primary-200">✓ Build completed in 1.8s</div>
                <div class="text-primary-200">✓ Tests passed (147/147)</div>
                <div class="text-primary-200">✓ Security scan clean</div>
                <div class="text-secondary-400">→ Deploying to production...</div>
                <div class="text-accent-400">✓ Deployment successful</div>
                <div class="text-warning-400">🚀 Live at https://client-app.com</div>
                <div class="text-primary-400 mt-4">Performance: 100/100</div>
                <div class="text-primary-400">Accessibility: 100/100</div>
                <div class="text-primary-400">SEO: 98/100</div>
                <div class="text-accent-400 animate-pulse mt-4 glow-green">$█</div>
              </div>
            </n-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Services - Dark Grid -->
    <section class="relative py-24 bg-gradient-primary overflow-hidden">
      <!-- Subtle tech pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-white mb-4 glow-cyan">Arsenal of Solutions</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Three core services. Maximum impact. Zero compromise.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" style="align-items: stretch;">
          <div class="flex flex-col h-full">
            <n-card 
              hoverable
              class="glass-morphism hover:shadow-xl hover:shadow-secondary-400/30 hover:-translate-y-2 transition-all duration-300 flex-1 flex flex-col"
              :bordered="false"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(34, 211, 238, 0.2); height: 100%;"
            >
                <div class="p-8 text-center h-full flex flex-col">
                  <div class="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary-400/50 glow-cyan">
                    <n-icon size="32" color="white">
                      <CodeBracketIcon />
                    </n-icon>
                  </div>
                  <h3 class="text-2xl font-black text-white mb-4">Web Apps</h3>
                  <p class="text-gray-300 mb-6 flex-1">
                    Lightning-fast web applications that scale. Built with modern frameworks, optimized for performance.
                  </p>
                  <div class="mt-auto">
                    <n-tag size="small" style="background: rgba(34, 211, 238, 0.2); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); backdrop-filter: blur(10px);">Frontend • Backend • Database</n-tag>
                  </div>
                </div>
            </n-card>
          </div>
          
          <div class="flex flex-col h-full">
            <n-card 
              hoverable
              class="glass-morphism hover:shadow-xl hover:shadow-accent-400/30 hover:-translate-y-2 transition-all duration-300 flex-1 flex flex-col"
              :bordered="false"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(74, 222, 128, 0.2); height: 100%;"
            >
                <div class="p-8 text-center h-full flex flex-col">
                  <div class="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-400/50 glow-green">
                    <n-icon size="32" color="white">
                      <CogIcon />
                    </n-icon>
                  </div>
                  <h3 class="text-2xl font-black text-white mb-4">Custom Solutions</h3>
                  <p class="text-gray-300 mb-6 flex-1">
                    Bespoke software tailored to your exact business needs. No templates, no shortcuts, just pure engineering.
                  </p>
                  <div class="mt-auto">
                    <n-tag size="small" style="background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); backdrop-filter: blur(10px);">APIs • Automation • Workflows</n-tag>
                  </div>
                </div>
            </n-card>
          </div>
          
          <div class="flex flex-col h-full">
            <n-card 
              hoverable
              class="glass-morphism hover:shadow-xl hover:shadow-purple-400/30 hover:-translate-y-2 transition-all duration-300 flex-1 flex flex-col"
              :bordered="false"
              style="background: rgba(9, 9, 11, 0.8); border: 1px solid rgba(192, 132, 252, 0.2); height: 100%;"
            >
                <div class="p-8 text-center h-full flex flex-col">
                  <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-400/50">
                    <n-icon size="32" color="white">
                      <ChartBarIcon />
                    </n-icon>
                  </div>
                  <h3 class="text-2xl font-black text-white mb-4">Strategy</h3>
                  <p class="text-gray-300 mb-6 flex-1">
                    Data-driven digital strategy that cuts through the noise. ROI-focused planning and execution.
                  </p>
                  <div class="mt-auto">
                    <n-tag size="small" style="background: rgba(251, 146, 60, 0.2); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3); backdrop-filter: blur(10px);">Data • Insights • Growth</n-tag>
                  </div>
                </div>
            </n-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="relative py-24 bg-gradient-primary overflow-hidden">
      <!-- Tech grid pattern - consistent with arsenal -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-white mb-4 glow-cyan">Proven Results</h2>
          <p class="text-xl text-gray-300">
            The numbers speak louder than marketing fluff.
          </p>
        </div>
        
        <n-grid cols="2 m:4" x-gap="24" y-gap="24" responsive="screen">
          <n-grid-item>
            <div class="text-center p-8 glass-light rounded-2xl hover:shadow-xl hover:shadow-secondary-400/20 transition-all duration-300">
              <div class="text-5xl font-black text-secondary-400 mb-2 glow-cyan">400%</div>
              <div class="text-gray-300 font-medium">Average traffic increase</div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="text-center p-8 glass-light rounded-2xl hover:shadow-xl hover:shadow-accent-400/20 transition-all duration-300">
              <div class="text-5xl font-black text-accent-400 mb-2 glow-green">$5.2M</div>
              <div class="text-gray-300 font-medium">Revenue generated</div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="text-center p-8 glass-light rounded-2xl hover:shadow-xl hover:shadow-purple-400/20 transition-all duration-300">
              <div class="text-5xl font-black text-purple-400 mb-2">9</div>
              <div class="text-gray-300 font-medium">Days average delivery</div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="text-center p-8 glass-light rounded-2xl hover:shadow-xl hover:shadow-warning-400/20 transition-all duration-300">
              <div class="text-5xl font-black text-warning-400 mb-2 glow-orange">Zero</div>
              <div class="text-gray-300 font-medium">Failed launches</div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-24 bg-gradient-primary overflow-hidden">
      <!-- Tech grid pattern - consistent with other sections -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <!-- Subtle energy elements -->
      <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div class="relative max-w-4xl mx-auto text-center px-6 lg:px-12">
        <h2 class="text-4xl font-black text-white mb-6 glow-cyan">
          Ready to Build Something Legendary?
        </h2>
        <p class="text-xl text-gray-300 mb-10">
          Stop wasting time with agencies that overpromise and underdeliver.
        </p>
        <n-button 
          size="large"
          strong
          style="background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%); color: white; border: none; padding: 20px 40px; font-size: 20px; height: auto; box-shadow: 0 4px 16px rgba(74, 222, 128, 0.25);"
          @click="$router.push('/contact')"
          class="hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-accent-500/30 glow-green"
        >
          <template #icon>
            <n-icon>
              <ArrowRightIcon />
            </n-icon>
          </template>
          Launch Your Vision
        </n-button>
      </div>
    </section>
    
    <!-- Back to Top -->
    <n-back-top 
      :right="40"
      :bottom="40"
      :visibility-height="300"
    >
      <n-card 
        size="small"
        class="shadow-lg"
        style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); border: none; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);"
        :bordered="false"
      >
        <n-icon size="20" color="white">
          <ArrowUpIcon />
        </n-icon>
      </n-card>
    </n-back-top>
  </div>
</template>

<script setup lang="ts">

</script>