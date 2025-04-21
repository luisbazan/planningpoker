<template>
  <div class="fixed left-8 top-1/2 -translate-y-1/2 w-64 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 transform transition-all duration-500 animate-slide-in">
    <!-- Header with Average -->
    <div class="text-center mb-6 transform transition-all duration-500 hover:scale-105">
      <div class="relative inline-block">
        <div class="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
        <div class="relative">
          <div class="text-slate-600 text-sm font-medium mb-1">Average Score</div>
          <div class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {{ average ?? '-' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Vote Distribution -->
    <div class="space-y-4">
      <h3 class="text-slate-600 text-sm font-medium">Vote Distribution</h3>
      <div class="space-y-3">
        <div v-for="[vote, count] in sortedVoteSummary" 
          :key="vote" 
          class="transform transition-all duration-300 hover:translate-x-2"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-slate-700 font-medium">{{ vote }}</span>
            <span class="text-slate-500 text-sm">{{ count }} {{ count === 1 ? 'vote' : 'votes' }}</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              :style="{ width: `${(count / totalVotes) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Votes -->
    <div class="mt-6 pt-4 border-t border-white/10">
      <div class="flex justify-between items-center text-sm">
        <span class="text-slate-600">Total Votes</span>
        <span class="text-slate-700 font-medium">{{ totalVotes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  votes: Array<{
    vote: number | string | null;
  }>;
}>();

const average = computed(() => {
  const numericVotes = props.votes
    .map(p => p.vote)
    .filter((vote): vote is number => typeof vote === 'number');
  
  if (numericVotes.length === 0) return null;
  
  const sum = numericVotes.reduce((a, b) => a + b, 0);
  return Math.round(sum / numericVotes.length);
});

const voteSummary = computed(() => {
  return props.votes.reduce((acc: Record<string, number>, { vote }) => {
    if (vote !== null) {
      const voteStr = String(vote);
      acc[voteStr] = (acc[voteStr] || 0) + 1;
    }
    return acc;
  }, {});
});

const sortedVoteSummary = computed(() => {
  const entries = Object.entries(voteSummary.value);
  return entries.sort((a, b) => {
    const aNum = a[0] === '?' ? Infinity : Number(a[0]);
    const bNum = b[0] === '?' ? Infinity : Number(b[0]);
    return aNum - bNum;
  });
});

const totalVotes = computed(() => {
  return props.votes.filter(v => v.vote !== null).length;
});
</script>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translate(-20px, -50%);
  }
  to {
    opacity: 1;
    transform: translate(0, -50%);
  }
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}

/* Efecto de brillo en hover para las barras */
.bg-gradient-to-r:hover {
  background-size: 200% 100%;
  background-position: right center;
  transition: background-position 0.5s ease-in-out;
}

/* Efecto de glass morphism mejorado */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Sombra con brillo */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              0 0 15px 0 rgba(59, 130, 246, 0.1);
}
</style> 