<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Players</h3>
      <div class="flex items-center space-x-3">
        <button v-if="isHost && canReveal"
          @click="$emit('reveal')"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          Reveal Votes
        </button>
        <button v-if="isHost"
          @click="$emit('next-round')"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Next Round
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <PlayerCard
        v-for="player in players"
        :key="player.id"
        :player-name="player.name"
        :is-host="player.isHost"
        :is-current-player="player.id === currentPlayerId"
        :vote="player.vote"
        :is-reveal-enabled="isRevealEnabled"
        :is-most-repeated-vote="isRevealEnabled && player.vote === mostRepeatedVote"
      />
    </div>

    <VoteResults
      v-if="isRevealEnabled"
      :is-reveal-enabled="isRevealEnabled"
      :most-repeated-vote="mostRepeatedVote"
      :vote-counts="voteCounts"
    />
  </div>
</template>

<script setup lang="ts">
import PlayerCard from './PlayerCard.vue';
import VoteResults from './VoteResults.vue';

defineProps<{
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    vote: number | string | null;
  }>;
  currentPlayerId: string | null;
  isHost: boolean;
  canReveal: boolean;
  isRevealEnabled: boolean;
  mostRepeatedVote: number | string | null;
  voteCounts: Record<string, number>;
}>();

defineEmits<{
  (e: 'reveal'): void;
  (e: 'next-round'): void;
}>();
</script> 