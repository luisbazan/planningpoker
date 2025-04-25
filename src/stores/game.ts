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
        const gameId = crypto.randomUUID();
        await gameRepository.createGame(gameId, hostId, hostName);
        const game = await gameRepository.getGame(gameId);
        if (!game) {
          throw new Error('Failed to create game');
        }
        this.currentGame = game;
        this.isHost = true;
        localStorage.setItem('playerId', hostId);
        return gameId;
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
    },

    async getGame(gameId: string): Promise<Game | null> {
      try {
        const game = await gameRepository.getGame(gameId);
        if (game) {
          this.currentGame = game;
          const currentPlayerId = localStorage.getItem('playerId');
          if (currentPlayerId) {
            const player = game.players.find(p => p.id === currentPlayerId);
            this.isHost = player?.isHost || false;
          }
        }
        return game;
      } catch (error) {
        console.error('Error getting game:', error);
        throw error;
      }
    },

    async addPlayer(gameId: string, playerId: string, playerName: string): Promise<void> {
      try {
        await gameRepository.addPlayer(gameId, playerId, playerName);
      } catch (error) {
        console.error('Error adding player:', error);
        throw error;
      }
    },

    async reconnectPlayer(gameId: string, playerId: string): Promise<void> {
      try {
        await gameRepository.reconnectPlayer(gameId, playerId);
      } catch (error) {
        console.error('Error reconnecting player:', error);
        throw error;
      }
    },

    async removePlayer(gameId: string, playerId: string): Promise<void> {
      try {
        await gameRepository.removePlayer(gameId, playerId);
      } catch (error) {
        console.error('Error removing player:', error);
        throw error;
      }
    },

    async transferHost(gameId: string, newHostId: string): Promise<void> {
      try {
        await gameRepository.transferHost(gameId, newHostId);
      } catch (error) {
        console.error('Error transferring host:', error);
        throw error;
      }
    },

    async submitVote(gameId: string, playerId: string, vote: string): Promise<void> {
      try {
        await gameRepository.submitVote(gameId, playerId, vote);
      } catch (error) {
        console.error('Error submitting vote:', error);
        throw error;
      }
    },

    async revealVotes(gameId: string): Promise<void> {
      try {
        await gameRepository.revealVotes(gameId);
      } catch (error) {
        console.error('Error revealing votes:', error);
        throw error;
      }
    },

    async startNewRound(gameId: string): Promise<void> {
      try {
        await gameRepository.startNewRound(gameId);
      } catch (error) {
        console.error('Error starting new round:', error);
        throw error;
      }
    },

    async updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
      try {
        await gameRepository.updateGame(gameId, updates);
      } catch (error) {
        console.error('Error updating game:', error);
        throw error;
      }
    },

    subscribeToGame(gameId: string): Subscription {
      return gameRepository.subscribeToGame(gameId).subscribe({
        next: (game) => {
          this.currentGame = game;
          const currentPlayerId = localStorage.getItem('playerId');
          if (currentPlayerId) {
            const player = game.players.find(p => p.id === currentPlayerId);
            this.isHost = player?.isHost || false;
          }
        },
        error: (error) => {
          console.error('Error in game subscription:', error);
        }
      });
    }
  },

  getters: {
    gameMode: (state) => state.currentGame?.status ?? 'waiting',
    currentVotes: (state) => state.playerVotes,
    canReveal: (state) => {
      if (!state.currentGame) return false;
      const currentPlayerId = localStorage.getItem('playerId');
      if (!currentPlayerId) return false;
      return state.isHost && state.currentGame.players.every(p => p.vote !== null);
    }
  }
});