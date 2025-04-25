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
          @reveal="revealVotes"
          @next-round="nextRound"
          @remove-player="handleRemovePlayer"
          @transfer-host="handleTransferHost"
        />

        <!-- Voting Area at the bottom -->
        <div class="max-w-2xl mx-auto">
          <VotingArea
            :current-vote="currentPlayerVote"
            :is-reveal-enabled="currentGame?.status === 'revealed'"
            :players="currentGame?.players || []"
            :current-player-id="playerId"
            @vote="castVote"
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
    let storedPlayerId = localStorage.getItem('playerId');
    let storedPlayerName = localStorage.getItem('playerName');
    
    if (!storedPlayerId) {
      storedPlayerId = await getBrowserId();
      localStorage.setItem('playerId', storedPlayerId);
    }
    
    playerId.value = storedPlayerId;

    // Obtener datos del juego
    const gameData = await gameStore.getGame(props.id);
    
    const playerExists = gameData.players.some(p => p.id === storedPlayerId);

    if (!playerExists) {
      if (storedPlayerName) {
        await gameStore.verifyAndCreatePlayer(props.id, storedPlayerId, storedPlayerName);
        subscription = gameStore.subscribeToGame(props.id);
      } else {
        showNameModal.value = true;
      }
    } else {
      await gameStore.verifyAndCreatePlayer(props.id, storedPlayerId);
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

const castVote = async (value: number | string) => {
  if (!playerId.value) return;
  
  try {
    await gameStore.updatePlayerVote(props.id, playerId.value, value);
  } catch (error) {
    console.error('Error casting vote:', error);
    toast.error('Failed to cast vote');
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
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // Remove player from the game only when explicitly leaving
    if (playerId.value && currentGame.value) {
      await gameStore.removePlayer(props.id, playerId.value);
      localStorage.removeItem('playerName');
    }
    
    router.push('/');
  } catch (error) {
    console.error('Error leaving game:', error);
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
const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
  if (playerId.value && currentGame.value) {
    try {
      await gameStore.removePlayer(props.id, playerId.value);
    } catch (error) {
      console.error('Error removing player on window close:', error);
    }
  }
  // Show a confirmation dialog (browser standard)
  event.preventDefault();
  event.returnValue = '';
};

onUnmounted(() => {
  // Only cleanup subscriptions and event listeners
  if (subscription) {
    subscription.unsubscribe();
  }
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