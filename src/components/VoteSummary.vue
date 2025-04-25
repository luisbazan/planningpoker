<template>
  <div class="fixed left-8 top-1/2 -translate-y-1/2 w-64 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 transform transition-all duration-500 animate-slide-in">
    <!-- Header with Average -->
    <div class="text-center mb-6 transform transition-all duration-500 hover:scale-105 animate-fade-in-up" style="animation-delay: 0.2s">
      <div class="relative inline-block">
        <div class="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
        <div class="relative">
          <div class="text-slate-600 text-sm font-medium mb-1">Average Score</div>
          <div class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-number-reveal">
            {{ average ?? '-' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Vote Distribution -->
    <div class="space-y-4 animate-fade-in-up" style="animation-delay: 0.4s">
      <h3 class="text-slate-600 text-sm font-medium">Vote Distribution</h3>
      <div class="space-y-3">
        <div v-for="([vote, count], index) in sortedVoteSummary" 
          :key="vote" 
          class="transform transition-all duration-300 hover:translate-x-2 animate-fade-in-right"
          :style="{
            animationDelay: `${0.6 + index * 0.1}s`,
            backgroundColor: isMostVoted(vote, count) ? 'rgba(236, 253, 245, 0.8)' : 'transparent'
          }"
          :class="{
            'rounded-lg p-2': isMostVoted(vote, count)
          }"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-slate-700 font-medium" :class="{ 'text-emerald-700': isMostVoted(vote, count) }">
              {{ vote }}
              <span v-if="isMostVoted(vote, count)" class="ml-1 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full animate-bounce">
                Most voted
              </span>
            </span>
            <span class="text-slate-500 text-sm" :class="{ 'text-emerald-600': isMostVoted(vote, count) }">
              {{ count }} {{ count === 1 ? 'vote' : 'votes' }}
            </span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000 ease-out animate-expand-width"
              :class="{
                'bg-gradient-to-r from-emerald-500 to-emerald-400': isMostVoted(vote, count),
                'bg-gradient-to-r from-blue-500 to-indigo-500': !isMostVoted(vote, count)
              }"
              :style="{ 
                width: `${(count / totalVotes) * 100}%`,
                animationDelay: `${0.8 + index * 0.1}s`
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Votes -->
    <div class="mt-6 pt-4 border-t border-white/10 animate-fade-in-up" style="animation-delay: 1s">
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
  return (sum / numericVotes.length).toFixed(1);
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

const isMostVoted = (vote: string, count: number) => {
  const maxVotes = Math.max(...Object.values(voteSummary.value));
  return count === maxVotes && count > 1;
};
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

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes expand-width {
  from {
    width: 0%;
  }
}

@keyframes number-reveal {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) translateY(0);
  }
  100% {
    transform: scale(1);
  }
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
  opacity: 0;
}

.animate-fade-in-right {
  animation: fade-in-right 0.5s ease-out forwards;
  opacity: 0;
}

.animate-expand-width {
  animation: expand-width 1s ease-out forwards;
}

.animate-number-reveal {
  animation: number-reveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Efecto de brillo en hover para las barras */
.bg-gradient-to-r {
  background-size: 200% 100%;
  transition: all 0.3s ease;
}

.bg-gradient-to-r:hover {
  background-position: right center;
  filter: brightness(1.1);
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

/* Transición suave para el fondo del voto más votado */
div[style*="backgroundColor"] {
  transition: background-color 0.3s ease;
}
</style> 