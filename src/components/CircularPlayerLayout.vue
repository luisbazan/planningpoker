<template>
  <div class="flex w-full min-h-[600px] gap-8 p-8">
    <!-- Left section - Vote Summary -->
    <div class="w-1/4">
      <VoteSummary v-if="isRevealEnabled" :votes="playerVotes" />
    </div>

    <!-- Center section - Players Grid -->
    <div class="w-1/2">
      <div class="grid grid-cols-5 gap-4 auto-rows-min">
        <!-- Host card always first -->
        <template v-for="(player, index) in players" :key="player.id">
          <div v-if="player.isHost" 
            class="relative transform transition-all duration-500 animate-fade-in">
            <div class="flex flex-col items-center">
              <div class="relative">
                <div class="player-card shadow-lg group"
                  :class="{
                    'selected': player.id === currentPlayerId,
                    'revealed': isRevealEnabled,
                    'has-voted': (player.vote !== null || (player.id === currentPlayerId && isVoteLoading)) && !isRevealEnabled,
                    'bg-slate-100': !isRevealEnabled && !player.vote && !(player.id === currentPlayerId && isVoteLoading),
                    'loading': player.id === currentPlayerId && isVoteLoading
                  }">
                  <template v-if="player.id === currentPlayerId && isVoteLoading">
                    <div class="flex items-center justify-center">
                      <div class="h-6 w-6 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin"></div>
                    </div>
                  </template>
                  <template v-else>
                    <span v-if="isRevealEnabled" class="text-2xl font-bold text-white">
                      {{ player.vote ?? '?' }}
                    </span>
                    <span v-else-if="player.vote !== null || (player.id === currentPlayerId && isVoteLoading)" class="text-xl font-bold text-emerald-500">
                      ✓
                    </span>
                    <span v-else class="text-xl font-bold text-slate-300">
                      ?
                    </span>
                  </template>
                </div>
                <div class="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm"
                  :class="{
                    'bg-purple-500 text-white': isRevealEnabled,
                    'bg-indigo-500 text-white': !isRevealEnabled
                  }">
                  Host
                </div>
              </div>
              <span class="text-slate-700 font-medium text-xs mt-1">{{ player.name }}</span>
            </div>
          </div>
        </template>

        <!-- Other players -->
        <template v-for="(player, index) in players" :key="player.id">
          <div v-if="!player.isHost" 
            class="relative transform transition-all duration-500 animate-fade-in">
            <div class="flex flex-col items-center">
              <div class="relative">
                <div class="player-card shadow-lg group"
                  :class="{
                    'selected': player.id === currentPlayerId,
                    'revealed': isRevealEnabled,
                    'has-voted': (player.vote !== null || (player.id === currentPlayerId && isVoteLoading)) && !isRevealEnabled,
                    'bg-slate-100': !isRevealEnabled && !player.vote && !(player.id === currentPlayerId && isVoteLoading),
                    'loading': player.id === currentPlayerId && isVoteLoading
                  }">
                  <template v-if="player.id === currentPlayerId && isVoteLoading">
                    <div class="flex items-center justify-center">
                      <div class="h-6 w-6 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin"></div>
                    </div>
                  </template>
                  <template v-else>
                    <span v-if="isRevealEnabled" class="text-2xl font-bold text-white">
                      {{ player.vote ?? '?' }}
                    </span>
                    <span v-else-if="player.vote !== null || (player.id === currentPlayerId && isVoteLoading)" class="text-xl font-bold text-emerald-500">
                      ✓
                    </span>
                    <span v-else class="text-xl font-bold text-slate-300">
                      ?
                    </span>
                  </template>
                  <div v-if="isHost && player.id !== currentPlayerId && canShowActions" 
                    class="absolute -right-2 top-0 bottom-0 flex flex-col justify-between py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="$emit('remove-player', player.id)"
                      class="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transform hover:scale-110 transition-all"
                      title="Remove player"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>

                    <button v-if="!player.isHost"
                      @click="$emit('transfer-host', player.id)"
                      class="p-1.5 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transform hover:scale-110 transition-all"
                      title="Make host"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <span class="text-slate-700 font-medium text-xs mt-1">{{ player.name }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Right section - Host Actions -->
    <div class="w-1/4 flex flex-col items-center justify-center gap-4">
      
      <!-- Host Actions -->
      <div v-if="isHost" class="flex flex-col gap-3 w-full max-w-xs">
        <!-- Reveal Votes button -->
        <button
          v-if="!isRevealEnabled"
          @click="$emit('reveal')"
          :disabled="!allPlayersVoted"
          class="px-6 py-3 text-white rounded-lg transition-all duration-200 shadow-md text-base font-medium w-full"
          :class="{
            'bg-blue-500 hover:bg-blue-600': allPlayersVoted,
            'bg-blue-300 cursor-not-allowed': !allPlayersVoted
          }"
        >
          <div class="flex items-center justify-center gap-2">
            <span>Reveal Votes</span>
            <span v-if="!allPlayersVoted" class="text-sm">
              ({{ votedCount }}/{{ totalPlayers }} voted)
            </span>
          </div>
        </button>

        <!-- Start New Round button -->
        <button
          v-if="isRevealEnabled"
          @click="$emit('next-round')"
          class="px-6 py-3 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all duration-200 shadow-md text-base font-medium w-full"
        >
          Start new voting
        </button>

        <!-- Reset Voting button -->
        <button
          v-if="!isRevealEnabled"
          @click="$emit('next-round')"
          class="px-6 py-3 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md text-base font-medium w-full"
        >
          Reset voting
        </button>
      </div>
    </div>
  </div>

  <!-- Host Transfer Notification -->
  <div v-if="showHostTransferNotification" 
    class="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
    <p class="text-sm font-medium">
      You were assigned as host by {{ previousHostName }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
  previousHostName?: string;
  isVoteLoading?: boolean;
}>();

const showHostTransferNotification = ref(false);

// Computed property para obtener el nombre del jugador actual
const currentPlayerName = computed(() => {
  const currentPlayer = props.players.find(p => p.id === props.currentPlayerId);
  return currentPlayer?.name || 'Unknown Player';
});

// Computed properties para el control de votos
const totalPlayers = computed(() => props.players.length);
const votedCount = computed(() => props.players.filter(p => p.vote !== null).length);
const allPlayersVoted = computed(() => votedCount.value === totalPlayers.value);

// Computed property to determine if host actions should be shown
const canShowActions = computed(() => {
  return !props.isRevealEnabled;
});

// Add computed property for votes
const playerVotes = computed(() => {
  console.log('Original players:', props.players);
  const votes = props.players.map(player => {
    // Convert numeric string votes to numbers
    let vote = player.vote;
    if (typeof vote === 'string' && !isNaN(Number(vote))) {
      vote = Number(vote);
    }
    console.log('Processing player vote:', player.vote, '→', vote);
    return { vote };
  });
  console.log('Processed votes:', votes);
  return votes;
});

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
  const nonHostPlayers = props.players.filter(p => !p.isHost);
  const totalPlayers = nonHostPlayers.length;
  const playerIndex = nonHostPlayers.findIndex(p => p.id === props.players[index].id);
  
  if (playerIndex === -1) return { transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }; // Fallback

  // Calculamos cuántos jugadores van arriba y abajo
  const topPlayers = Math.ceil(totalPlayers / 2);
  const bottomPlayers = Math.floor(totalPlayers / 2);

  // Configuración de posicionamiento
  const containerWidth = 1000; // Ancho fijo del contenedor para cálculos
  const cardWidth = 80; // Ancho aproximado de una carta
  const topRowY = '15%';
  const bottomRowY = '85%';

  // Calculamos si el jugador va arriba o abajo
  const isTopRow = playerIndex < topPlayers;
  
  let x;
  if (isTopRow) {
    // Para la fila superior, comenzamos después del host
    const availableWidth = containerWidth - 200; // Restamos el espacio del host
    const totalSpacing = availableWidth - (topPlayers * cardWidth);
    const spacing = totalSpacing / (topPlayers + 1);
    const startX = 200; // px (después del host)
    x = startX + spacing + (playerIndex * (cardWidth + spacing));
  } else {
    // Para la fila inferior, distribuimos uniformemente
    const bottomIndex = playerIndex - topPlayers;
    const availableWidth = containerWidth - 100; // Margen en los bordes
    const totalSpacing = availableWidth - (bottomPlayers * cardWidth);
    const spacing = totalSpacing / (bottomPlayers + 1);
    const startX = 50; // Margen izquierdo
    x = startX + spacing + (bottomIndex * (cardWidth + spacing));
  }

  // Convertimos la posición a porcentaje para que sea responsivo
  const xPercentage = (x / containerWidth) * 100;

  return {
    left: `${xPercentage}%`,
    top: isTopRow ? topRowY : bottomRowY,
    transform: 'translate(-50%, -50%)'
  };
};

const getZIndex = (index: number) => {
  const totalPlayers = props.players.filter(p => !p.isHost).length;
  const angle = (index * (360 / totalPlayers) - 90) * (Math.PI / 180);
  // Aseguramos que las cartas de jugadores estén siempre por debajo de la mesa central
  return Math.round(Math.sin(angle) * 5) + 10;
};
</script>

<style scoped>
.player-card {
  @apply relative flex items-center justify-center w-20 h-28 rounded-lg transition-all duration-300;
}

.player-card.loading {
  @apply bg-emerald-50;
}

.player-card.selected {
  @apply ring-2 ring-blue-500;
}

.player-card.revealed {
  @apply bg-gradient-to-br from-blue-500 to-blue-600 transform scale-105;
}

.player-card.has-voted {
  @apply bg-gradient-to-br from-emerald-50 to-emerald-100 ring-2 ring-emerald-500/30;
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