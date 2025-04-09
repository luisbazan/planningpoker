<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">
          <div class="divide-y divide-gray-200">
            <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <h1 class="text-3xl font-bold text-center mb-8">Planning Poker</h1>
              <div class="space-y-4">
                <button
                  @click="createNewGame"
                  class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Create New Game
                </button>
                <div class="relative">
                  <input
                    v-model="gameId"
                    type="text"
                    placeholder="Enter Game ID"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    @click="joinExistingGame"
                    class="mt-2 w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Join Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useToast } from 'vue-toastification';
import { getBrowserId } from '@/utils/browserId';

const router = useRouter();
const gameStore = useGameStore();
const toast = useToast();
const gameId = ref('');

const createNewGame = async () => {
  try {
    const hostId = await getBrowserId();
    const newGameId = await gameStore.createGame(hostId);
    router.push(`/game/${newGameId}`);
  } catch (error) {
    toast.error('Failed to create game');
  }
};

const joinExistingGame = async () => {
  if (!gameId.value) {
    toast.warning('Please enter a game ID');
    return;
  }

  try {
    const playerId = await getBrowserId();
    await gameStore.joinGame(gameId.value, {
      id: playerId,
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      vote: null,
      isReady: false
    });
    router.push(`/game/${gameId.value}`);
  } catch (error) {
    toast.error('Failed to join game');
  }
};
</script>