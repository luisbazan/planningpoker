<template>
  <div class="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">
          <div class="divide-y divide-gray-200">
            <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <h1 class="text-3xl font-bold text-center mb-8">Planning Poker</h1>
              <div class="space-y-4">
                <button
                  @click="createNewGame"
                  :disabled="isLoading"
                  class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <span v-if="isLoading && currentAction === 'create'">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {{ isLoading && currentAction === 'create' ? 'Creating Game...' : 'Create New Game' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Name Modal -->
    <PlayerNameModal
      v-model="showNameModal"
      :title="'Game Setup'"
      :description="'Please enter your name to create a new game.'"
      :submit-text="'Create Game'"
      @submit="handleHostNameSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useToast } from 'vue-toastification';
import { getBrowserId } from '@/utils/browserId';
import PlayerNameModal from '@/components/PlayerNameModal.vue';

const router = useRouter();
const gameStore = useGameStore();
const toast = useToast();
const isLoading = ref(false);
const currentAction = ref<'create' | 'join' | null>(null);
const showNameModal = ref(false);
const pendingHostId = ref<string | null>(null);

const createNewGame = async () => {
  try {
    // Check if we already have a stored player name
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');
    
    if (storedPlayerId && storedPlayerName) {
      // If we have both ID and name, create game directly
      isLoading.value = true;
      currentAction.value = 'create';
      const newGameId = await gameStore.createGame(storedPlayerId, storedPlayerName);
      router.push(`/game/${newGameId}`);
    } else {
      // If we don't have stored session, show modal
      const hostId = await getBrowserId();
      pendingHostId.value = hostId;
      showNameModal.value = true;
    }
  } catch (error) {
    console.error('Error in game creation:', error);
    toast.error('Failed to initialize game creation');
  } finally {
    if (isLoading.value) {
      isLoading.value = false;
      currentAction.value = null;
    }
  }
};

const handleHostNameSubmit = async (name: string) => {
  if (!pendingHostId.value) return;
  
  isLoading.value = true;
  currentAction.value = 'create';
  
  try {
    // Store both ID and name
    localStorage.setItem('playerId', pendingHostId.value);
    localStorage.setItem('playerName', name);
    
    const newGameId = await gameStore.createGame(pendingHostId.value, name);
    router.push(`/game/${newGameId}`);
  } catch (error) {
    console.error('Error creating game:', error);
    toast.error('Failed to create game');
  } finally {
    isLoading.value = false;
    currentAction.value = null;
  }
};
</script>