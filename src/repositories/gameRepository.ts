import { db } from '@/services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Game, Player } from '@/types/firebase';

export interface GameRepository {
  getGame(gameId: string): Promise<Game>;
  createGame(gameId: string, hostId: string, hostName: string): Promise<void>;
  updateGame(gameId: string, updates: Partial<Game>): Promise<void>;
  updatePlayers(gameId: string, players: Player[]): Promise<void>;
  updatePlayerVote(gameId: string, playerId: string, vote: string | null): Promise<void>;
  revealVotes(gameId: string): Promise<void>;
  resetVotes(gameId: string): Promise<void>;
}

export const gameRepository: GameRepository = {
  async getGame(gameId: string): Promise<Game> {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    return gameDoc.data() as Game;
  },

  async createGame(gameId: string, hostId: string, hostName: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    const newGame: Game = {
      id: gameId,
      players: [{
        id: hostId,
        name: hostName,
        vote: null,
        isHost: true
      }],
      status: 'waiting',
      removedPlayers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(gameRef, newGame);
  },

  async updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async updatePlayers(gameId: string, players: Player[]): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      players,
      updatedAt: new Date()
    });
  },

  async updatePlayerVote(gameId: string, playerId: string, vote: string | null): Promise<void> {
    const game = await this.getGame(gameId);
    const updatedPlayers = game.players.map(player => 
      player.id === playerId ? { ...player, vote } : player
    );
    
    await this.updatePlayers(gameId, updatedPlayers);
  },

  async revealVotes(gameId: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      status: 'revealed',
      updatedAt: new Date()
    });
  },

  async resetVotes(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    const updatedPlayers = game.players.map(player => ({
      ...player,
      vote: null
    }));
    
    await updateDoc(gameRef, {
      players: updatedPlayers,
      status: 'waiting',
      updatedAt: new Date()
    });
  }
}; 