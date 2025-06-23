<template>
  <div id="app">
    <n-message-provider>
      <Navbar />
      <main>
        <router-view />
      </main>
      <Footer />
    </n-message-provider>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>