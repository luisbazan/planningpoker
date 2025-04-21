<template>
  <div class="relative w-full h-[300px] max-w-3xl mx-auto">
    <!-- Vote Summary Component -->
    <VoteSummary v-if="isRevealEnabled" :votes="players" />

    <!-- Central area -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-24 bg-blue-100/80 rounded-3xl flex flex-col items-center justify-center animate-fade-in shadow-lg">
      <span v-if="!isHost && !isRevealEnabled" class="text-slate-600 text-lg">
        Pick your cards!
      </span>
      <button v-if="isHost && !isRevealEnabled"
        @click="$emit('reveal')"
        class="px-6 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm text-sm">
        Reveal Votes
      </button>
      <button v-else-if="isHost && isRevealEnabled"
        @click="$emit('next-round')"
        class="px-6 py-2.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all duration-200 shadow-sm text-sm">
        Start new voting
      </button>
    </div>

    <!-- Players in circle -->
    <template v-for="(player, index) in players" :key="player.id">
      <div class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 animate-fade-in"
        :style="{
          left: `${getPlayerPosition(index).x}%`,
          top: `${getPlayerPosition(index).y}%`,
          animationDelay: `${index * 0.1}s`,
          zIndex: getZIndex(index)
        }">
        <div class="flex flex-col items-center">
          <div class="relative">
            <div class="player-card shadow-lg group"
              :class="{
                'selected': player.id === currentPlayerId,
                'revealed': isRevealEnabled,
                'most-voted': isRevealEnabled && player.vote === mostRepeatedVote,
                'has-voted': player.vote !== null && !isRevealEnabled,
                'bg-slate-100': !isRevealEnabled
              }">
              <span v-if="isRevealEnabled" class="text-2xl font-bold text-white">
                {{ player.vote ?? '?' }}
              </span>
              <span v-else-if="player.vote !== null" class="text-xl font-bold text-emerald-500">
                ✓
              </span>
              <span v-else class="text-xl font-bold text-slate-300">
                ?
              </span>
              <div v-if="isHost && player.id !== currentPlayerId" class="absolute -top-1.5 -right-1.5">
                <button
                  @click="$emit('remove-player', player.id)"
                  class="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100"
                  title="Remove player"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div v-if="isHost && player.id !== currentPlayerId" class="absolute -bottom-1.5 -right-1.5">
                <button
                  @click="$emit('transfer-host', player.id)"
                  class="p-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100"
                  title="Make host"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="player.isHost" 
              class="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-semibold bg-indigo-500 text-white rounded-full shadow-sm">
              Host
            </div>
          </div>
          <span class="text-slate-700 font-medium text-xs mt-1">{{ player.name }}</span>
        </div>
      </div>
    </template>

    <!-- Host Transfer Notification -->
    <div v-if="showHostTransferNotification" 
      class="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
      <p class="text-sm font-medium">
        You were assigned as host by {{ previousHostName }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import VoteSummary from './VoteSummary.vue';

const props = defineProps<{
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    vote: number | string | null;
  }>;
  currentPlayerId: string | null;
  isHost: boolean;
  isRevealEnabled: boolean;
  mostRepeatedVote: number | string | null;
  previousHostName?: string;
}>();

const showHostTransferNotification = ref(false);

onMounted(() => {
  if (props.previousHostName) {
    showHostTransferNotification.value = true;
    setTimeout(() => {
      showHostTransferNotification.value = false;
    }, 5000);
  }
});

defineEmits<{
  (e: 'reveal'): void;
  (e: 'next-round'): void;
  (e: 'remove-player', playerId: string): void;
  (e: 'transfer-host', playerId: string): void;
}>();

const getPlayerPosition = (index: number) => {
  const totalPlayers = props.players.length;
  
  // Ajustamos el ángulo inicial según el número de jugadores
  let startAngle = -90; // Comenzamos desde arriba
  
  // Calculamos el espacio entre jugadores
  const angleStep = 360 / totalPlayers;
  
  // Calculamos el radio base y ajustamos según el número de jugadores
  let radius = 28; // Radio base más pequeño
  
  // Para 2 jugadores, los colocamos a los lados
  if (totalPlayers === 2) {
    startAngle = -180;
    radius = 25;
  }
  // Para 3-4 jugadores, ajustamos el radio
  else if (totalPlayers <= 4) {
    radius = 25;
  }
  // Para 5-8 jugadores
  else if (totalPlayers <= 8) {
    radius = 28;
  }
  // Para 9-10 jugadores
  else {
    radius = 32;
  }
  
  // Calculamos la posición final
  const angle = (startAngle + index * angleStep) * (Math.PI / 180);
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  
  return { x, y };
};

const getZIndex = (index: number) => {
  const totalPlayers = props.players.length;
  const angle = (index * (360 / totalPlayers) - 90) * (Math.PI / 180);
  return Math.round(Math.sin(angle) * 10) + 10;
};
</script>

<style scoped>
.player-card {
  @apply relative w-12 h-16 rounded-lg flex flex-col items-center justify-center mb-1;
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.player-card.selected {
  @apply ring-2 ring-blue-500;
  animation: pulse-soft 2s ease-in-out infinite;
}

.player-card.has-voted {
  @apply ring-2 ring-emerald-500/30;
}

.player-card.revealed {
  @apply bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-400/50;
  transform: scale(1.05);
}

.player-card.most-voted {
  @apply bg-gradient-to-br from-emerald-500 to-emerald-600 ring-2 ring-emerald-400;
  animation: pulse-winner 2s ease-in-out infinite;
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