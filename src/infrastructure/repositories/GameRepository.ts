import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import type { Game, Player } from '@/domain/models/Game';

export class GameRepository {
  private gamesCollection = collection(db, 'games');

  async createGame(hostId: string): Promise<Game> {
    const gameDoc = doc(this.gamesCollection);
    const newGame: Game = {
      id: gameDoc.id,
      hostId,
      players: [],
      currentRound: 0,
      isRevealEnabled: false,
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(gameDoc, newGame);
    return newGame;
  }

  async joinGame(gameId: string, player: Player): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const game = gameDoc.data() as Game;
    
    // Check if player already exists
    const playerExists = game.players.some(p => p.id === player.id);
    
    if (!playerExists) {
      await updateDoc(gameRef, {
        players: [...game.players, player],
        updatedAt: new Date()
      });
    }
  }

  subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    const gameRef = doc(this.gamesCollection, gameId);
    return onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Game);
      }
    });
  }
}