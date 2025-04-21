<template>
  <div class="bg-white/95 backdrop-blur-sm rounded-xl p-3 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xl mx-auto shadow-lg border border-slate-200">
    <div v-if="isRemoved" class="text-center py-4">
      <div class="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">You've been removed from the game</h3>
        <p class="text-gray-600 mt-1">The host has removed you from this session</p>
      </div>
      <button
        @click="$emit('rejoin')"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Rejoin Game
      </button>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-semibold text-slate-800">Your Vote</h3>
        <span v-if="currentVote" 
          class="px-2.5 py-1 text-sm font-medium bg-blue-500 text-white rounded-lg shadow-sm">
          Current: {{ currentVote }}
        </span>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
        <button v-for="value in [1, 2, 3, 5, 8, 13, 21, 34, '?']" :key="value"
          @click="$emit('vote', value)"
          class="relative group aspect-[2/3] min-h-[60px] rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm overflow-hidden"
          :class="{ 
            'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400': currentVote === value,
            'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 hover:border-slate-400 hover:from-slate-200 hover:to-slate-300': currentVote !== value
          }">
          <span class="relative text-lg font-bold" :class="{
            'text-white': currentVote === value,
            'text-slate-700': currentVote !== value
          }">{{ value }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentVote: number | string | null;
  isRemoved?: boolean;
}>();

defineEmits<{
  (e: 'vote', value: number | string): void;
  (e: 'rejoin'): void;
}>();
</script>

<style scoped>
button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform-style: preserve-3d;
  transform: perspective(1000px);
}

button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  z-index: 1;
}

button:hover::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
}
</style> 