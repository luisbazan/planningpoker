<template>
  <div class="min-h-screen bg-gray-100 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <div class="border-b border-gray-200 pb-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Game Room: {{ props.id }}
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ isHost ? '(Host)' : '(Player)' }}
          </p>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <!-- Players List -->
          <div class="sm:col-span-3">
            <h4 class="text-lg font-medium text-gray-900">Players</h4>
            <div class="mt-4 space-y-4">
              <div v-for="player in currentGame?.players" :key="player.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{{ player.name }}</span>
                <span v-if="currentGame?.isRevealEnabled">
                  {{ player.vote ?? '?' }}
                </span>
                <span v-else>
                  {{ player.vote ? '✓' : '...' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Voting Area -->
          <div class="sm:col-span-3">
            <h4 class="text-lg font-medium text-gray-900">Your Vote</h4>
            <div class="mt-4 grid grid-cols-3 gap-4">
              <button v-for="value in [1, 2, 3, 5, 8, 13, 21, 34, '?']" :key="value"
                @click="castVote(value)"
                class="p-4 text-center border rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'bg-blue-100': currentVote === value }">
                {{ value }}
              </button>
            </div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="mt-8 flex justify-end space-x-4">
          <button v-if="isHost && canReveal"
            @click="revealVotes"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Reveal Votes
          </button>
          <button v-if="isHost"
            @click="nextRound"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Next Round
          </button>
          <button @click="leaveGame"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Leave Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import type { Game } from '@/domain/models/Game';
import { Subscription } from 'rxjs';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const gameStore = useGameStore();
const toast = useToast();
const currentVote = ref<number | string | null>(null);

// Use store state directly
const currentGame = computed(() => gameStore.currentGame);
const isHost = computed(() => gameStore.isHost);
const canReveal = computed(() => gameStore.canReveal);

let subscription: Subscription | null = null;

onMounted(async () => {
  try {
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      toast.error('Player ID not found');
      router.push('/');
      return;
    }

    await gameStore.verifyAndCreatePlayer(props.id, playerId);
    subscription = gameStore.subscribeToGame(props.id);
  } catch (error) {
    toast.error('Failed to join game');
    router.push('/');
  }
});

const castVote = (value: number | string) => {
  currentVote.value = value;
  // Update vote in the game state
};

const revealVotes = () => {
  // Implement reveal votes logic
};

const nextRound = () => {
  // Implement next round logic
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