<template>
  <div class="relative group">
    <div class="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
      :class="{ 
        'bg-blue-50 border-l-4 border-blue-500': isCurrentPlayer,
        'bg-gray-50 hover:bg-gray-100': !isCurrentPlayer,
        'border-2 border-green-500': isRevealEnabled && isMostRepeatedVote
      }">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span class="text-indigo-700 font-medium text-lg">{{ playerName.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-if="isHost" class="absolute -top-1 -right-1">
            <span class="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full shadow-sm">
              Host
            </span>
          </div>
        </div>
        <span class="font-medium text-gray-900">{{ playerName }}</span>
      </div>
      <div class="flex items-center space-x-3">
        <span v-if="isRevealEnabled" 
          class="min-w-[3rem] text-center px-4 py-2 text-sm font-semibold rounded-lg"
          :class="{
            'bg-green-100 text-green-800': isMostRepeatedVote,
            'bg-gray-100 text-gray-800': !isMostRepeatedVote
          }">
          {{ vote ?? '?' }}
        </span>
        <span v-else>
          <span v-if="vote" class="text-green-500">
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

    <!-- Overlay with remove button (only visible to host and not for self) -->
    <div v-if="canRemovePlayer" 
         class="invisible group-hover:visible absolute inset-0 flex items-center justify-center transition-all duration-200 rounded-lg">
      <div class="absolute inset-0 bg-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      <button
        @click="$emit('remove-player')"
        class="invisible group-hover:visible transform scale-0 group-hover:scale-100 p-2 bg-white text-red-600 hover:bg-red-50 rounded-full shadow-lg transition-all duration-200 ease-in-out hover:scale-110 z-10"
        title="Remove player"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playerName: string;
  isHost: boolean;
  isCurrentPlayer: boolean;
  vote: number | string | null;
  isRevealEnabled: boolean;
  isMostRepeatedVote: boolean;
  canRemovePlayer: boolean;
}>();

defineEmits<{
  (e: 'remove-player'): void;
}>();
</script> 