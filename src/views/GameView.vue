<template>
  <div class="min-h-screen bg-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <GameHeader 
        :game-id="props.id"
        :player-name="currentPlayerName"
        @leave="leaveGame" 
        @name-updated="handleNameUpdate"
      />

      <div class="mt-8 space-y-8">
        <!-- Circular Layout -->
        <CircularPlayerLayout
          :players="currentGame?.players || []"
          :current-player-id="playerId"
          :is-host="isHost"
          :is-reveal-enabled="currentGame?.status === 'revealed'"
          :previous-host-name="previousHostName"
          :is-vote-loading="isVoteLoading"
          @reveal="revealVotes"
          @next-round="nextRound"
          @remove-player="handleRemovePlayer"
          @transfer-host="handleTransferHost"
        />

        <!-- Voting Area at the bottom -->
        <div class="max-w-2xl mx-auto">
          <VotingArea
            :current-vote="optimisticVote || currentPlayerVote"
            :is-reveal-enabled="currentGame?.status === 'revealed'"
            :players="currentGame?.players || []"
            :current-player-id="playerId"
            @vote="handleVote"
            @local-vote-update="handleLocalVoteUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Player Name Modal -->
    <PlayerNameModal
      v-model="showNameModal"
      @submit="handlePlayerNameSubmit"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-model="showConfirmationModal"
      :title="confirmationModalTitle"
      :message="confirmationModalMessage"
      confirm-button-text="Confirm"
      @confirm="handleConfirmation"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { Subscription } from 'rxjs';
import { useToast } from 'vue-toastification';
import { getBrowserId } from '@/utils/browserId';
import GameHeader from '@/components/GameHeader.vue';
import CircularPlayerLayout from '@/components/CircularPlayerLayout.vue';
import VotingArea from '@/components/VotingArea.vue';
import PlayerNameModal from '@/components/PlayerNameModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const gameStore = useGameStore();
const toast = useToast();
const playerId = ref<string | null>(null);
const showNameModal = ref(false);
const showConfirmationModal = ref(false);
const confirmationModalTitle = ref('');
const confirmationModalMessage = ref('');
const confirmationModalAction = ref<'remove' | 'transfer' | null>(null);
const pendingPlayerId = ref<string | null>(null);
const isVoteLoading = ref(false);
const optimisticVote = ref<string | number | null>(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Use store state directly
const currentGame = computed(() => gameStore.currentGame);
const isHost = computed(() => gameStore.isHost);

// Get current player's vote
const currentPlayerVote = computed(() => {
  if (!currentGame.value || !playerId.value) return null;
  const player = currentGame.value.players.find(p => p.id === playerId.value);
  return player?.vote ?? null;
});

// Add this computed property after the other computed properties
const currentPlayerName = computed(() => {
  if (!currentGame.value || !playerId.value) return '';
  const player = currentGame.value.players.find(p => p.id === playerId.value);
  return player?.name || '';
});

let subscription: Subscription | null = null;

onMounted(async () => {
  try {
    // Check if we need to clean up a player from a previous session
    const removePlayerId = localStorage.getItem(`removePlayer_${props.id}`);
    const removeTimestamp = localStorage.getItem(`removePlayerTimestamp_${props.id}`);
    
    if (removePlayerId && removeTimestamp) {
      const timestamp = parseInt(removeTimestamp);
      // Only try to remove if the timestamp is less than 1 minute old
      if (Date.now() - timestamp < 60 * 1000) {
        try {
          await gameStore.removePlayer(props.id, removePlayerId);
        } catch (error) {
          console.error('Error removing player from previous session:', error);
        }
      }
      // Clean up the localStorage entries
      localStorage.removeItem(`removePlayer_${props.id}`);
      localStorage.removeItem(`removePlayerTimestamp_${props.id}`);
    }

    let storedPlayerId = localStorage.getItem('playerId');
    let storedPlayerName = localStorage.getItem('playerName');
    
    if (!storedPlayerId) {
      storedPlayerId = await getBrowserId();
      localStorage.setItem('playerId', storedPlayerId);
    }
    
    playerId.value = storedPlayerId;

    // Obtener datos del juego
    const gameData = await gameStore.getGame(props.id);
    
    const existingPlayer = gameData.players.find(p => p.id === storedPlayerId);
    const wasHost = existingPlayer?.isHost || false;

    if (!existingPlayer) {
      if (storedPlayerName) {
        // Si no hay jugadores, el primero en unirse será el host
        const shouldBeHost = gameData.players.length === 0;
        await gameStore.verifyAndCreatePlayer(props.id, storedPlayerId, storedPlayerName, shouldBeHost);
        subscription = gameStore.subscribeToGame(props.id);
      } else {
        showNameModal.value = true;
      }
    } else {
      // Mantener el estado de host al reconectarse
      await gameStore.verifyAndCreatePlayer(props.id, storedPlayerId, existingPlayer.name, wasHost);
      subscription = gameStore.subscribeToGame(props.id);
    }

    // Only add beforeunload event listener for window close
    window.addEventListener('beforeunload', handleBeforeUnload);
  } catch (error) {
    console.error('Error joining game:', error);
    toast.error('Failed to join game');
    router.push('/');
  }
});

const handlePlayerNameSubmit = async (name: string) => {
  if (!playerId.value) return;
  
  try {
    // Store the name immediately
    localStorage.setItem('playerName', name);
    
    // Create player in the game and wait for it to complete
    await gameStore.verifyAndCreatePlayer(props.id, playerId.value, name);
    
    // Update UI state
    showNameModal.value = false;
    
    // Subscribe to game updates after player is created
    subscription = gameStore.subscribeToGame(props.id);

    // Force an immediate update of the game state
    await gameStore.getGame(props.id);
    
    toast.success('Successfully joined the game!');
  } catch (error) {
    console.error('Error registering player:', error);
    toast.error('Failed to join game');
    router.push('/');
  }
};

function handleLocalVoteUpdate(vote: string | number) {
  optimisticVote.value = vote;
}

const handleVote = async (vote: string | number) => {
  if (!playerId.value) return;
  
  isVoteLoading.value = true;
  try {
    await gameStore.updatePlayerVote(props.id, playerId.value, vote);
  } finally {
    isVoteLoading.value = false;
    // Clear the optimistic vote after the real update
    optimisticVote.value = null;
  }
};

const revealVotes = async () => {
  try {
    await gameStore.revealVotes(props.id);
  } catch (error) {
    console.error('Error revealing votes:', error);
    toast.error('Failed to reveal votes');
  }
};

const nextRound = async () => {
  try {
    await gameStore.resetVotes(props.id);
  } catch (error) {
    console.error('Error resetting votes:', error);
    toast.error('Failed to reset votes');
  }
};

const leaveGame = async () => {
  try {
    // Save current vote state before leaving
    const currentPlayer = currentGame.value?.players.find(p => p.id === playerId.value);
    if (currentPlayer?.vote) {
      localStorage.setItem(`lastVote_${props.id}`, currentPlayer.vote.toString());
    }
    
    // Always clean up subscription first
    cleanupSubscription();
    
    // Then handle player removal if needed
    if (playerId.value && currentGame.value && 
        currentGame.value.status !== 'revealed' && 
        !currentGame.value.players.find(p => p.id === playerId.value && p.isHost)) {
      await gameStore.removePlayer(props.id, playerId.value);
      localStorage.removeItem('playerName');
    }
    
    router.push('/');
  } catch (error) {
    console.error('Error leaving game:', error);
    // Even if there's an error, try to remove the player as a fallback
    try {
      if (playerId.value) {
        await gameStore.removePlayer(props.id, playerId.value);
      }
    } catch (e) {
      console.error('Failed fallback removal:', e);
    }
    toast.error('Failed to leave game properly');
    router.push('/');
  }
};

const handleNameUpdate = async (newName: string) => {
  if (!playerId.value || !currentGame.value) return;
  
  try {
    const updatedPlayers = currentGame.value.players.map(player => 
      player.id === playerId.value ? { ...player, name: newName } : player
    );
    
    await gameStore.updatePlayers(props.id, updatedPlayers);
    toast.success('Name updated successfully!');
  } catch (error) {
    console.error('Error updating name:', error);
    toast.error('Failed to update name');
  }
};

const handleRemovePlayer = (playerIdToRemove: string) => {
  confirmationModalTitle.value = 'Remove Player';
  confirmationModalMessage.value = 'Are you sure you want to remove this player from the game?';
  confirmationModalAction.value = 'remove';
  pendingPlayerId.value = playerIdToRemove;
  showConfirmationModal.value = true;
};

const handleTransferHost = (newHostId: string) => {
  const newHost = currentGame.value?.players.find(p => p.id === newHostId);
  confirmationModalTitle.value = 'Transfer Host Role';
  confirmationModalMessage.value = `Are you sure you want to transfer the host role to ${newHost?.name || 'this player'}?`;
  confirmationModalAction.value = 'transfer';
  pendingPlayerId.value = newHostId;
  showConfirmationModal.value = true;
};

const handleConfirmation = async () => {
  if (!pendingPlayerId.value) return;

  try {
    if (confirmationModalAction.value === 'remove') {
      await gameStore.removePlayer(props.id, pendingPlayerId.value);
      toast.success('Player removed successfully');
    } else if (confirmationModalAction.value === 'transfer') {
      await gameStore.transferHost(pendingPlayerId.value);
      toast.success('Host role transferred successfully');
    }
  } catch (error) {
    console.error('Error performing action:', error);
    toast.error('Failed to perform action');
  } finally {
    showConfirmationModal.value = false;
    confirmationModalAction.value = null;
    pendingPlayerId.value = null;
  }
};

// Add the handleBeforeUnload function
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!currentGame.value || !playerId.value) return;

  const currentPlayer = currentGame.value.players.find(p => p.id === playerId.value);
  if (!currentPlayer) return;

  const isCurrentPlayerHost = currentPlayer.isHost;
  const hasVoted = currentPlayer.vote !== null;
  const isVotingPhase = currentGame.value.status !== 'revealed';

  // Clean up subscription synchronously
  cleanupSubscription();

  // Save current vote if exists
  if (currentPlayer.vote) {
    localStorage.setItem(`lastVote_${props.id}`, currentPlayer.vote.toString());
  }

  // Show confirmation if player has voted or if voting is in progress
  if (isVotingPhase && !isCurrentPlayerHost && (hasVoted || currentGame.value.players.some(p => p.vote !== null))) {
    const message = hasVoted 
      ? 'You have already voted in this round. If you leave now, your vote will be removed. Are you sure?'
      : 'Voting is in progress. If you leave now, you will be removed from the game. Are you sure?';
    event.preventDefault();
    event.returnValue = message;
  }

  // Remove player if not host and votes are not revealed
  if (!isCurrentPlayerHost && isVotingPhase) {
    try {
      // Use a synchronous request to ensure it completes before page unload
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${window.location.origin}/api/games/${props.id}/players/${playerId.value}/remove`, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        gameId: props.id,
        playerId: playerId.value,
        timestamp: Date.now()
      }));

      // Backup plan: Store in localStorage
      localStorage.setItem(`removePlayer_${props.id}`, playerId.value);
      localStorage.setItem(`removePlayerTimestamp_${props.id}`, Date.now().toString());
    } catch (error) {
      console.error('Failed to remove player:', error);
      // If the XHR fails, try using the Firestore API directly
      try {
        const gameRef = doc(db, 'games', props.id);
        const updatedPlayers = currentGame.value.players.filter(p => p.id !== playerId.value);
        updateDoc(gameRef, {
          players: updatedPlayers,
          updatedAt: new Date()
        });
      } catch (e) {
        console.error('Failed backup removal:', e);
      }
    }
  }
};

// Helper function to clean up subscription
const cleanupSubscription = () => {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
};

onUnmounted(() => {
  // Clean up subscription and event listeners
  cleanupSubscription();
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

/* Añadir transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Mejorar la escala en hover */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Sombras suaves */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>