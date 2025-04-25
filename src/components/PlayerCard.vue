<template>
  <div class="relative transform transition-all duration-500 animate-fade-in">
    <div class="flex flex-col items-center">
      <div class="relative group">
        <div class="player-card shadow-lg"
          :class="{
            'selected': isCurrentPlayer,
            'revealed': isRevealEnabled && vote !== null && !isSpecialVote,
            'revealed-special': isRevealEnabled && vote !== null && isSpecialVote,
            'most-voted': isRevealEnabled && isMostRepeatedVote && !isSpecialVote,
            'has-voted': vote !== null && !isRevealEnabled,
            'bg-slate-100': !isRevealEnabled
          }">
          <div class="card-content">
            <span v-if="isRevealEnabled" class="text-2xl font-bold text-white">
              {{ vote ?? '?' }}
            </span>
            <span v-else-if="vote !== null" class="text-xl font-bold text-emerald-500">
              ✓
            </span>
            <span v-else class="text-xl font-bold text-slate-300">
              ?
            </span>
          </div>
        </div>

        <!-- Host Badge -->
        <div v-if="player.isHost" 
          class="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm"
          :class="{
            'bg-purple-500 text-white': isRevealEnabled,
            'bg-indigo-500 text-white': !isRevealEnabled
          }">
          Host
        </div>

        <!-- Action Buttons -->
        <div v-if="canShowActions" 
          class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div class="absolute -top-1.5 -right-1.5">
            <button
              @click.stop="$emit('remove-player', playerId)"
              class="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transform transition-transform duration-200 hover:scale-110"
              title="Remove player"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="absolute -bottom-1.5 -right-1.5">
            <button
              @click.stop="$emit('transfer-host', playerId)"
              class="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md transform transition-transform duration-200 hover:scale-110"
              title="Make host"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <span class="text-slate-700 font-medium text-xs mt-1">{{ playerName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  player: {
    id: string;
    name: string;
    isHost: boolean;
    vote: number | string | null;
  };
  isCurrentPlayer: boolean;
  isHost: boolean;
  isRevealEnabled: boolean;
  mostRepeatedVote: number | string | null;
}>();

// Computed properties
const playerName = computed(() => props.player.name);
const playerId = computed(() => props.player.id);
const vote = computed(() => props.player.vote);
const isSpecialVote = computed(() => {
  const voteStr = String(props.player.vote);
  return ['?', '🍺', '💀'].includes(voteStr);
});
const isMostRepeatedVote = computed(() => props.player.vote === props.mostRepeatedVote);
const canShowActions = computed(() => {
  // Mostrar acciones solo si:
  // 1. El jugador actual es host (props.isHost)
  // 2. No es el propio jugador actual
  // 3. El jugador objetivo no es el host actual
  return props.isHost && !props.isCurrentPlayer && !props.player.isHost;
});

defineEmits<{
  (e: 'remove-player', playerId: string): void;
  (e: 'transfer-host', playerId: string): void;
}>();
</script>

<style scoped>
.player-card {
  @apply relative w-20 h-28 rounded-lg flex flex-col items-center justify-center mb-1;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.card-content {
  @apply flex items-center justify-center w-full h-full;
  z-index: 1;
  backface-visibility: hidden;
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.player-card.selected {
  @apply ring-2 ring-blue-500 bg-blue-50;
  animation: pulse-soft 2s ease-in-out infinite;
}

.player-card.has-voted {
  @apply ring-2 ring-emerald-500/30;
}

.player-card.revealed {
  @apply bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-400/50;
  transform: scale(1.05) rotateY(-180deg);
  animation: reveal 0.5s ease-out forwards;
}

.player-card.revealed-special {
  @apply bg-gradient-to-br from-purple-600 to-purple-700 ring-2 ring-purple-400/50;
  transform: scale(1.05) rotateY(-180deg);
  animation: reveal 0.5s ease-out forwards;
}

.player-card.most-voted {
  @apply bg-gradient-to-br from-emerald-500 to-emerald-600 ring-2 ring-emerald-400;
  animation: pulse-winner 2s ease-in-out infinite;
}

/* Asegurarnos que revealed-special tenga prioridad sobre most-voted */
.player-card.revealed-special.most-voted {
  @apply bg-gradient-to-br from-purple-700 to-purple-800 ring-2 ring-purple-500/50;
  animation: reveal 0.5s ease-out forwards;
}

/* Asegurarnos que selected tenga prioridad cuando no está revelado */
.player-card.selected:not(.revealed):not(.revealed-special) {
  @apply ring-2 ring-blue-500 bg-blue-50;
  animation: pulse-soft 2s ease-in-out infinite;
  transform: translateY(-2px);
}

@keyframes reveal {
  0% {
    transform: scale(1) rotateY(0);
  }
  50% {
    transform: scale(1.1) rotateY(-90deg);
  }
  100% {
    transform: scale(1.05) rotateY(-180deg);
  }
}

@keyframes pulse-soft {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@keyframes pulse-winner {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style> 