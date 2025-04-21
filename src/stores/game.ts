import { defineStore } from 'pinia';
import type { Game, Player, GameState } from '@/domain/models/Game';
import { GameRepository } from '@/infrastructure/repositories/GameRepository';
import { Subscription } from 'rxjs';

const gameRepository = new GameRepository();

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentGame: null as Game | null,
    playerVotes: new Map<string, number>(),
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

    async verifyAndCreatePlayer(gameId: string, playerId: string, playerName?: string) {
      try {
        await gameRepository.verifyAndCreatePlayer(gameId, playerId, playerName);
        const game = await gameRepository.getGame(gameId);
        if (game) {
          this.currentGame = game;
          this.isHost = game.players.some(p => p.id === playerId && p.isHost);
        }
      } catch (error) {
        console.error('Error joining game:', error);
        throw error;
      }
    },

    async updatePlayerVote(gameId: string, playerId: string, vote: number | string | null) {
      try {
        await gameRepository.updatePlayerVote(gameId, playerId, vote);
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
        await gameRepository.removePlayer(gameId, playerId);
        // El estado se actualizará automáticamente a través de la suscripción
      } catch (error) {
        console.error('Error removing player:', error);
        throw error;
      }
    },

    async rejoinPlayer(gameId: string, playerId: string, playerName: string) {
      try {
        await gameRepository.rejoinPlayer(gameId, playerId, playerName);
        // El estado se actualizará automáticamente a través de la suscripción
      } catch (error) {
        console.error('Error rejoining player:', error);
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