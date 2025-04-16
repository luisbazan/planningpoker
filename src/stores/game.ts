import { defineStore } from 'pinia';
import type { Game, Player, GameState } from '@/domain/models/Game';
import { GameRepository } from '@/infrastructure/repositories/GameRepository';
import { Subscription } from 'rxjs';

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

    async verifyAndCreatePlayer(gameId: string, playerId: string) {
      try {
        await gameRepository.verifyAndCreatePlayer(gameId, playerId);
      } catch (error) {
        console.error('Error verifying/creating player:', error);
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

    async nextRound(gameId: string): Promise<void> {
      try {
        await gameRepository.nextRound(gameId);
      } catch (error) {
        console.error('Error starting next round:', error);
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