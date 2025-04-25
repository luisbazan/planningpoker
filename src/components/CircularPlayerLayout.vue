<template>
  <div class="flex w-full min-h-[600px] gap-8 p-8">
    <!-- Left section - Vote Summary -->
    <div class="w-1/4">
      <VoteSummary v-if="isRevealEnabled" :votes="players" />
    </div>

    <!-- Center section - Players Grid -->
    <div class="w-1/2">
      <div class="grid grid-cols-5 gap-4 auto-rows-min">
        <template v-for="player in sortedPlayers" :key="player.id">
          <PlayerCard
            :player="player"
            :is-current-player="player.id === currentPlayerId"
            :is-host="isHost"
            :is-reveal-enabled="isRevealEnabled"
            :most-repeated-vote="mostRepeatedVote"
            @remove-player="handleRemovePlayer"
            @transfer-host="handleTransferHost"
          />
        </template>
      </div>
    </div>

    <!-- Right section - Host Actions -->
    <div class="w-1/4 flex flex-col items-center justify-center gap-4">
      <HostActions
        v-if="isHost"
        :is-reveal-enabled="isRevealEnabled"
        :all-players-voted="allPlayersVoted"
        :voted-count="votedCount"
        :total-players="totalPlayers"
        @reveal="$emit('reveal')"
        @next-round="$emit('next-round')"
      />
    </div>
  </div>

  <!-- Host Transfer Notification -->
  <TransitionRoot
    appear
    :show="showHostTransferNotification"
    as="template"
    enter="transform transition duration-300"
    enter-from="opacity-0 translate-y-2"
    enter-to="opacity-100 translate-y-0"
    leave="transform duration-200 transition ease-in"
    leave-from="opacity-100 translate-y-0"
    leave-to="opacity-0 translate-y-1"
  >
    <div class="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      <p class="text-sm font-medium">
        You were assigned as host by {{ previousHostName }}
      </p>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VoteSummary from './VoteSummary.vue';
import PlayerCard from './PlayerCard.vue';
import HostActions from './HostActions.vue';
import { TransitionRoot } from '@headlessui/vue';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  vote: number | string | null;
}

const props = defineProps<{
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  isRevealEnabled: boolean;
  mostRepeatedVote: number | string | null;
  previousHostName?: string;
}>();

const showHostTransferNotification = ref(false);

// Computed properties
const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => {
    // Host always first
    if (a.isHost) return -1;
    if (b.isHost) return 1;
    return a.name.localeCompare(b.name);
  });
});

const totalPlayers = computed(() => props.players.length);
const votedCount = computed(() => props.players.filter(p => p.vote !== null).length);
const allPlayersVoted = computed(() => votedCount.value === totalPlayers.value);

// Event handlers
const handleRemovePlayer = (playerId: string) => {
  emit('remove-player', playerId);
};

const handleTransferHost = (playerId: string) => {
  emit('transfer-host', playerId);
};

// Event emits
const emit = defineEmits<{
  (e: 'reveal'): void;
  (e: 'next-round'): void;
  (e: 'remove-player', playerId: string): void;
  (e: 'transfer-host', playerId: string): void;
}>();

// Lifecycle hooks
onMounted(() => {
  if (props.previousHostName) {
    showHostTransferNotification.value = true;
    setTimeout(() => {
      showHostTransferNotification.value = false;
    }, 5000);
  }
});
</script>

<style scoped>
.player-card {
  @apply relative w-20 h-28 rounded-lg flex flex-col items-center justify-center mb-1;
  transition: all 0.3s ease;
}

.card-content {
  @apply flex items-center justify-center w-full h-full;
  z-index: 1;
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

@keyframes reveal {
  0% {
    transform: scale(1) rotateY(0);
  }
  50% {
    transform: scale(1.1) rotateY(90deg);
  }
  100% {
    transform: scale(1.05) rotateY(180deg);
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