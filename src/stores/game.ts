import { defineStore } from 'pinia';
import type { Game, Player, GameState } from '@/domain/models/Game';
import { GameRepository } from '@/infrastructure/repositories/GameRepository';

const gameRepository = new GameRepository();

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentGame: null,
    playerVotes: new Map(),
    isHost: false
  }),

  actions: {
    async createGame(hostId: string) {
      try {
        const game = await gameRepository.createGame(hostId);
        this.currentGame = game;
        this.isHost = true;
        return game.id;
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
    },

    async joinGame(gameId: string, player: Player) {
      try {
        await gameRepository.joinGame(gameId, player);
        this.isHost = false;
      } catch (error) {
        console.error('Error joining game:', error);
        throw error;
      }
    },

    subscribeToGame(gameId: string) {
      return gameRepository.subscribeToGame(gameId, (game) => {
        this.currentGame = game;
      });
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