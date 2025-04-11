import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import type { Game, Player } from '@/domain/models/Game';
import { Observable } from 'rxjs';

export class GameRepository {
  private gamesCollection = collection(db, 'games');

  async createGame(hostId: string): Promise<Game> {
    const gameDoc = doc(this.gamesCollection);
    const hostPlayer: Player = {
      id: hostId,
      name: 'Host',
      vote: null,
      isReady: false,
      isHost: true
    };

    const newGame: Game = {
      id: gameDoc.id,
      hostId,
      players: [hostPlayer],
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

  async verifyAndCreatePlayer(gameId: string, playerId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const game = gameDoc.data() as Game;
    const playerExists = game.players.some(p => p.id === playerId);

    if (!playerExists) {
      const newPlayer: Player = {
        id: playerId,
        name: `Player ${Math.floor(Math.random() * 1000)}`,
        vote: null,
        isReady: false,
        isHost: false
      };

      await updateDoc(gameRef, {
        players: [...game.players, newPlayer],
        updatedAt: new Date()
      });
    }
  }

  subscribeToGame(gameId: string): Observable<Game> {
    return new Observable<Game>(subscriber => {
      const gameRef = doc(this.gamesCollection, gameId);
      return onSnapshot(gameRef, 
        (doc) => {
          if (doc.exists()) {
            subscriber.next(doc.data() as Game);
            console.log('Game updated:', doc.data());
          }
        },
        (error) => {
          subscriber.error(error);
        }
      );
    });
  }
}