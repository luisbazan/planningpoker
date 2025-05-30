<template>
  <div v-if="isPlayerInGame" class="bg-white/95 backdrop-blur-sm rounded-xl p-3 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xl mx-auto shadow-lg border border-slate-200">
    <!-- Voting Area -->
    <div v-if="!isRevealEnabled">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-semibold text-slate-800">Your Vote</h3>
        <span v-if="currentVote" 
          class="px-2.5 py-1 text-sm font-medium bg-blue-500 text-white rounded-lg shadow-sm">
          Current: {{ currentVote }}
        </span>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
        <button
          v-for="value in voteValues"
          :key="value"
          @click="handleVote(value)"
          class="relative group aspect-[2/3] min-h-[60px] rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm overflow-hidden"
          :class="{
            'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-400 shadow-lg scale-105': String(currentVote) === String(value),
            'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 hover:border-slate-400 hover:from-slate-200 hover:to-slate-300': String(currentVote) !== String(value),
            'cursor-not-allowed': loadingVote !== null
          }"
          :disabled="loadingVote !== null">
          <div class="relative flex items-center justify-center w-full h-full">
            <template v-if="loadingVote === value">
              <svg class="animate-spin h-5 w-5" :class="{'text-white': String(currentVote) === String(value), 'text-blue-500': String(currentVote) !== String(value)}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </template>
            <template v-else>
              <span class="relative text-lg font-bold" :class="{
                'text-white': String(currentVote) === String(value),
                'text-slate-700': String(currentVote) !== String(value)
              }">{{ value }}</span>
            </template>
          </div>
          <div v-if="String(currentVote) === String(value)" class="absolute inset-0 bg-blue-400/10 animate-pulse"></div>
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
import { computed, ref } from 'vue';

const props = defineProps<{
  currentVote: number | string | null;
  isRevealEnabled: boolean;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    vote: number | string | null;
  }>;
  currentPlayerId: string | null;
}>();

const voteValues = [1, 2, 3, 5, 8, 13, '?', '🍺', '💀'];
const loadingVote = ref<number | string | null>(null);

const isPlayerInGame = computed(() => {
  if (!props.currentPlayerId || !props.players) return false;
  return props.players.some(player => player.id === props.currentPlayerId);
});

const emit = defineEmits<{
  (e: 'vote', value: number | string): void;
  (e: 'localVoteUpdate', value: number | string): void;
}>();

async function handleVote(value: number | string) {
  // Optimistic update - immediately show the vote locally
  emit('localVoteUpdate', value);
  
  loadingVote.value = value;
  try {
    await emit('vote', value);
  } finally {
    setTimeout(() => {
      loadingVote.value = null;
    }, 300);
  }
}
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

button:disabled {
  opacity: 0.7;
}

button:disabled:hover {
  transform: none;
}
</style> 