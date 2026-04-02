<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #2c2c2c;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  font-family: var(--font-body);
}

.app-container {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  background-color: var(--bg-primary);
  background-image: var(--paper-texture);
  position: relative;
  overflow-x: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
