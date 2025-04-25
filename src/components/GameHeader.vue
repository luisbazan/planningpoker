<template>
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-6">
        <!-- Game ID section -->
        <div class="flex items-center space-x-2">
          <h2 class="text-lg font-semibold text-gray-900">Game ID: {{ gameId }}</h2>
          <button
            @click="copyGameId"
            class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          >
            <span class="sr-only">Copy game ID</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6zm0-2h8a4 4 0 014 4v11a4 4 0 01-4 4H6a4 4 0 01-4-4V5a4 4 0 014-4z" />
            </svg>
          </button>
        </div>

        <!-- Player name section -->
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Playing as:</span>
          <span class="text-sm font-medium text-gray-900">{{ currentPlayerName }}</span>
          <button
            @click="editName"
            class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
            title="Edit name"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu button -->
      <div class="relative">
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        
        <!-- Menu Dropdown -->
        <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div class="py-1">
            <button
              @click="copyGameLink"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Copy Game Link
            </button>
            <button
              @click="editName"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Name
            </button>
            <button
              @click="$emit('leave')"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              Leave Game
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Name Modal -->
    <PlayerNameModal
      v-model="showEditNameModal"
      title="Edit Name"
      description="Enter your new name"
      submit-text="Save"
      :initial-value="currentPlayerName"
      @submit="handleNameEdit"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import PlayerNameModal from './PlayerNameModal.vue';

const props = defineProps<{
  gameId: string;
  playerName: string;
}>();

const emit = defineEmits<{
  (e: 'leave'): void;
  (e: 'nameUpdated', name: string): void;
}>();

const toast = useToast();
const isMenuOpen = ref(false);
const showEditNameModal = ref(false);
const currentPlayerName = ref(props.playerName);

watch(() => props.playerName, (newName) => {
  currentPlayerName.value = newName;
});

const copyGameId = async () => {
  try {
    await navigator.clipboard.writeText(props.gameId);
    toast.success('Game ID copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy game ID:', error);
    toast.error('Failed to copy game ID');
  }
};

const copyGameLink = async () => {
  const gameUrl = `${window.location.origin}/game/${props.gameId}`;
  try {
    await navigator.clipboard.writeText(gameUrl);
    toast.success('Game link copied to clipboard!');
    isMenuOpen.value = false;
  } catch (error) {
    console.error('Failed to copy game link:', error);
    toast.error('Failed to copy game link');
  }
};

const editName = () => {
  isMenuOpen.value = false;
  showEditNameModal.value = true;
};

const handleNameEdit = (newName: string) => {
  localStorage.setItem('playerName', newName);
  currentPlayerName.value = newName;
  emit('nameUpdated', newName);
};
</script> 