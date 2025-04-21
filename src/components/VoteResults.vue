<template>
  <div v-if="isRevealEnabled && mostRepeatedVote" 
    class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <h4 class="text-sm font-medium text-gray-900">Most repeated vote</h4>
      </div>
      <span class="px-4 py-2 text-sm font-bold bg-green-100 text-green-800 rounded-lg">
        {{ mostRepeatedVote }}
      </span>
    </div>
    <div class="space-y-2">
      <p class="text-xs font-medium text-gray-500">Vote distribution:</p>
      <div v-for="(count, vote) in voteCounts" :key="vote"
        class="flex items-center justify-between bg-white p-2 rounded-lg">
        <span class="font-medium text-gray-700">{{ vote }}</span>
        <span class="text-sm text-gray-600">{{ count }} vote{{ count > 1 ? 's' : '' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isRevealEnabled: boolean;
  mostRepeatedVote: number | string | null;
  voteCounts: Record<string, number>;
}>();
</script> 