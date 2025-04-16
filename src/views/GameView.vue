<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h2 class="text-xl font-bold text-white">Game Room</h2>
              <div class="px-3 py-1 text-sm font-medium bg-white/20 text-white rounded-full">
                {{ props.id }}
              </div>
            </div>
            <button @click="leaveGame" 
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              Leave Game
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Players Section -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Players</h3>
              <div class="flex items-center space-x-3">
                <button v-if="isHost && canReveal"
                  @click="revealVotes"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  Reveal Votes
                </button>
                <button v-if="isHost"
                  @click="nextRound"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                  Next Round
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <div v-for="player in currentGame?.players" :key="player.id"
                class="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                :class="{ 
                  'bg-blue-50 border-l-4 border-blue-500': player.id === playerId,
                  'bg-gray-50 hover:bg-gray-100': player.id !== playerId,
                  'border-2 border-green-500': currentGame?.isRevealEnabled && player.vote === currentGame?.mostRepeatedVote
                }">
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-indigo-700 font-medium text-lg">{{ player.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div v-if="player.isHost" class="absolute -top-1 -right-1">
                      <span class="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full shadow-sm">
                        Host
                      </span>
                    </div>
                  </div>
                  <span class="font-medium text-gray-900">{{ player.name }}</span>
                </div>
                <div class="flex items-center">
                  <span v-if="currentGame?.isRevealEnabled" 
                    class="min-w-[3rem] text-center px-4 py-2 text-sm font-semibold rounded-lg"
                    :class="{
                      'bg-green-100 text-green-800': player.vote === currentGame?.mostRepeatedVote,
                      'bg-gray-100 text-gray-800': player.vote !== currentGame?.mostRepeatedVote
                    }">
                    {{ player.vote ?? '?' }}
                  </span>
                  <span v-else>
                    <span v-if="player.vote" class="text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </span>
                    <span v-else class="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Vote Results -->
            <div v-if="currentGame?.isRevealEnabled && currentGame?.mostRepeatedVote" 
              class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <h4 class="text-sm font-medium text-gray-900">Most repeated vote</h4>
                </div>
                <span class="px-4 py-2 text-sm font-bold bg-green-100 text-green-800 rounded-lg">
                  {{ currentGame.mostRepeatedVote }}
                </span>
              </div>
              <div class="space-y-2">
                <p class="text-xs font-medium text-gray-500">Vote distribution:</p>
                <div v-for="(count, vote) in currentGame.voteCounts" :key="vote"
                  class="flex items-center justify-between bg-white p-2 rounded-lg">
                  <span class="font-medium text-gray-700">{{ vote }}</span>
                  <span class="text-sm text-gray-600">{{ count }} vote{{ count > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Voting Area -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Your Vote</h3>
              <span v-if="currentPlayerVote" 
                class="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-800 rounded-lg">
                Current: {{ currentPlayerVote }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <button v-for="value in [1, 2, 3, 5, 8, 13, 21, 34, '?']" :key="value"
                @click="castVote(value)"
                class="p-6 text-center rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :class="{ 
                  'bg-blue-100 border-2 border-blue-300 shadow-sm': currentPlayerVote === value,
                  'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50': currentPlayerVote !== value
                }">
                <span class="text-2xl font-bold" :class="{
                  'text-blue-800': currentPlayerVote === value,
                  'text-gray-700': currentPlayerVote !== value
                }">{{ value }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { Subscription } from 'rxjs';
import { useToast } from 'vue-toastification';
import { getBrowserId } from '@/utils/browserId';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const gameStore = useGameStore();
const toast = useToast();
const playerId = ref<string | null>(null);

// Use store state directly
const currentGame = computed(() => gameStore.currentGame);
const isHost = computed(() => gameStore.isHost);
const canReveal = computed(() => gameStore.canReveal);

// Get current player's vote
const currentPlayerVote = computed(() => {
  if (!currentGame.value || !playerId.value) return null;
  const player = currentGame.value.players.find(p => p.id === playerId.value);
  return player?.vote ?? null;
});

let subscription: Subscription | null = null;

onMounted(async () => {
  try {
    let storedPlayerId = localStorage.getItem('playerId');
    
    // If playerId doesn't exist, create a new one
    if (!storedPlayerId) {
      storedPlayerId = await getBrowserId();
      localStorage.setItem('playerId', storedPlayerId);
    }
    
    playerId.value = storedPlayerId;

    await gameStore.verifyAndCreatePlayer(props.id, storedPlayerId);
    subscription = gameStore.subscribeToGame(props.id);
  } catch (error) {
    console.error('Error joining game:', error);
    toast.error('Failed to join game');
    router.push('/');
  }
});

const castVote = async (value: number | string) => {
  if (!playerId.value) return;
  
  try {
    await gameStore.updatePlayerVote(props.id, playerId.value, value);
  } catch (error) {
    console.error('Error casting vote:', error);
    toast.error('Failed to cast vote');
  }
};

const revealVotes = async () => {
  try {
    await gameStore.revealVotes(props.id);
  } catch (error) {
    console.error('Error revealing votes:', error);
    toast.error('Failed to reveal votes');
  }
};

const nextRound = async () => {
  try {
    await gameStore.nextRound(props.id);
  } catch (error) {
    console.error('Error starting next round:', error);
    toast.error('Failed to start next round');
  }
};

const leaveGame = () => {
  if (subscription) {
    subscription.unsubscribe();
  }
  router.push('/');
};

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
});
</script>

<style>
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
  animation: fade-in 0.5s ease-out;
}

/* Añadir transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Mejorar la escala en hover */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Sombras suaves */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>