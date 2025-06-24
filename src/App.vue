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

</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>