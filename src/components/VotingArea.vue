<template>
  <div v-if="isInGame" class="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 fixed bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-full max-w-xl mx-auto shadow-lg border border-slate-200">
    <!-- Voting Area -->
      <div v-if="!isRevealEnabled">
        <div class="flex items-center justify-between mb-2 sm:mb-3">
          <h3 class="text-sm sm:text-base font-semibold text-slate-800">Your Vote</h3>
          <span v-if="currentVote" 
            class="px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-blue-500 text-white rounded-lg shadow-sm">
            Current: {{ currentVote }}
          </span>
        </div>
        <div class="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-9 gap-1 sm:gap-1.5">
          <button v-for="value in [1, 2, 3, 5, 8, 13, '?', '🍺', '💀']" :key="value"
            @click="$emit('vote', value)"
            class="relative group aspect-[2/3] min-h-[40px] sm:min-h-[60px] rounded-md sm:rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm overflow-hidden"
            :class="{ 
              'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-400 shadow-lg scale-105': currentVote === value,
              'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 hover:border-slate-400 hover:from-slate-200 hover:to-slate-300': currentVote !== value
            }">
            <span class="relative text-base sm:text-lg font-bold" :class="{
              'text-white': currentVote === value,
              'text-slate-700': currentVote !== value
            }">{{ value }}</span>
            <div v-if="currentVote === value" class="absolute inset-0 bg-blue-400/10 animate-pulse"></div>
          </button>
        </div>
      </div>

      <!-- Revealed State Message -->
      <div v-else class="text-center py-4">
        <div class="flex items-center justify-center mb-3">
          <div class="bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-sm">
            <span class="text-lg font-semibold">Your Vote: {{ currentVote ?? '?' }}</span>
          </div>
        </div>
        <p class="text-sm text-slate-600">Voting is closed. Wait for the host to start a new round.</p>
      </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentVote: number | string | null;
  isRevealEnabled: boolean;
  isInGame: boolean;
}>();

const emit = defineEmits<{
  (e: 'vote', value: number | string): void;
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
  -webkit-tap-highlight-color: transparent;
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

@keyframes soft-pulse {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.1;
  }
}

.animate-pulse {
  animation: soft-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 640px) {
  button:active {
    transform: scale(0.95);
  }
}
</style> 