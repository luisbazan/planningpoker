import { defineStore } from 'pinia';
import type { Game, Player } from '@/domain/models/Game';
import { GameRepository } from '@/infrastructure/repositories/GameRepository';
import { Subscription } from 'rxjs';

const gameRepository = new GameRepository();

interface GameStoreState {
  currentGame: Game | null;
  playerVotes: Map<string, string | number>;
  isHost: boolean;
}

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({
    currentGame: null,
    playerVotes: new Map<string, string | number>(),
    isHost: false
  }),

  actions: {
    async createGame(hostId: string, hostName: string): Promise<string> {
      try {
        const gameId = await gameRepository.createGame(hostId, hostName);
        const game = await gameRepository.getGame(gameId);
        if (!game) {
          throw new Error('Failed to create game');
        }
        this.currentGame = game;
        this.isHost = true;
        return gameId;
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
    },

    async getGame(gameId: string): Promise<Game> {
      try {
        const game = await gameRepository.getGame(gameId);
        if (!game) {
          throw new Error('Game not found');
        }
        this.currentGame = game;
        this.isHost = game.players.some(p => p.id === localStorage.getItem('playerId') && p.isHost);
        return game;
      } catch (error) {
        console.error('Error getting game:', error);
        throw error;
      }
    },

    async verifyAndCreatePlayer(gameId: string, playerId: string, playerName?: string, isHost?: boolean): Promise<void> {
      try {
        await gameRepository.verifyAndCreatePlayer(gameId, playerId, playerName, isHost);
        
        // Actualizar el estado local
        this.currentGame = await gameRepository.getGame(gameId);
        this.isHost = this.currentGame.players.find(p => p.id === playerId)?.isHost || false;
      } catch (error) {
        console.error('Error verifying/creating player:', error);
        throw error;
      }
    },

    async updatePlayerVote(gameId: string, playerId: string, vote: number | string | null) {
      try {
        const voteAsString = vote === null ? null : vote.toString();
        await gameRepository.updatePlayerVote(gameId, playerId, voteAsString);
      } catch (error) {
        console.error('Error updating player vote:', error);
        throw error;
      }
    },

    async updatePlayers(gameId: string, players: Player[]) {
      try {
        await gameRepository.updatePlayers(gameId, players);
      } catch (error) {
        console.error('Error updating players:', error);
        throw error;
      }
    },

    subscribeToGame(gameId: string): Subscription {
      return gameRepository.subscribeToGame(gameId).subscribe({
        next: (game) => {
          this.currentGame = game;
          // Update isHost based on the current player's ID
          const currentPlayerId = localStorage.getItem('playerId');
          this.isHost = game.players.some(p => p.id === currentPlayerId && p.isHost);
        },
        error: (error) => {
          console.error('Error in game subscription:', error);
        }
      });
    },

    async revealVotes(gameId: string): Promise<void> {
      try {
        await gameRepository.revealVotes(gameId);
      } catch (error) {
        console.error('Error revealing votes:', error);
        throw error;
      }
    },

    async resetVotes(gameId: string): Promise<void> {
      try {
        await gameRepository.resetVotes(gameId);
      } catch (error) {
        console.error('Error resetting votes:', error);
        throw error;
      }
    },

    async removePlayer(gameId: string, playerId: string) {
      try {
        if (!this.currentGame) return;
        
        // Filter out the player to be removed
        const updatedPlayers = this.currentGame.players.filter(p => p.id !== playerId);
        
        // Update the game with the new players array
        await gameRepository.updatePlayers(gameId, updatedPlayers);
        
        // If the current game state is available, update it
        if (this.currentGame) {
          this.currentGame.players = updatedPlayers;
        }
      } catch (error) {
        console.error('Error removing player:', error);
        throw error;
      }
    },

    async transferHost(newHostId: string) {
      try {
        if (!this.currentGame) {
          throw new Error('No active game');
        }
        
        const currentPlayerId = localStorage.getItem('playerId');
        if (!currentPlayerId) {
          throw new Error('No player ID found');
        }
        
        await gameRepository.transferHost(this.currentGame.id, newHostId);
        const game = await gameRepository.getGame(this.currentGame.id);
        if (game) {
          this.currentGame = game;
          this.isHost = game.players.some(p => p.id === currentPlayerId && p.isHost);
        }
      } catch (error) {
        console.error('Error transferring host:', error);
        throw error;
      }
    }
  },

  getters: {
    gameMode: (state) => state.currentGame?.status ?? 'waiting',
    currentVotes: (state) => state.playerVotes,
    canReveal: (state) => {
      if (!state.currentGame) return false;
      return state.isHost && state.currentGame.players.every(p => p.vote !== null);
    }
  }
});