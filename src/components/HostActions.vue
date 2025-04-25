<template>
  <div class="flex flex-col gap-3 w-full max-w-xs">
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
</template>

<script setup lang="ts">
defineProps<{
  isRevealEnabled: boolean;
  allPlayersVoted: boolean;
  votedCount: number;
  totalPlayers: number;
}>();

defineEmits<{
  (e: 'reveal'): void;
  (e: 'next-round'): void;
}>();
</script> 