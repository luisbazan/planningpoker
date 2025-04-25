import { ref, onUnmounted } from 'vue';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import type { Game, Player } from '@/domain/models/Game';
import { Observable } from 'rxjs';
import { firebaseConfig } from '../../firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class GameRepository {
  private gamesCollection = collection(db, 'games');

  async createGame(hostId: string, hostName: string): Promise<string> {
    const gameId = Math.random().toString(36).substring(2, 9);
    const gameRef = doc(db, 'games', gameId);
    
    const newGame: Game = {
      id: gameId,
      hostId,
      players: [{
        id: hostId,
        name: hostName,
        vote: null,
        isHost: true
      }],
      status: 'waiting',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(gameRef, newGame);
    return gameId;
  }

  async getGame(gameId: string): Promise<Game> {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    return gameDoc.data() as Game;
  }

  async joinGame(gameId: string, player: Player): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const existingPlayer = gameData.players.find(p => p.id === player.id);

    if (existingPlayer) {
      // If player exists, update their name
      const updatedPlayers = gameData.players.map(p => 
        p.id === player.id ? { ...p, name: player.name } : p
      );

      await updateDoc(gameRef, {
        players: updatedPlayers,
        updatedAt: Timestamp.now()
      });
    } else {
      // If player doesn't exist, add them to the game
      await updateDoc(gameRef, {
        players: [...gameData.players, player],
        updatedAt: Timestamp.now()
      });
    }
  }

  async verifyAndCreatePlayer(gameId: string, playerId: string, playerName?: string, isHost: boolean = false): Promise<void> {
    const game = await this.getGame(gameId);
    const existingPlayer = game.players.find(p => p.id === playerId);
    
    if (!existingPlayer && !playerName) {
      throw new Error('Player name is required for new players');
    }

    if (!existingPlayer && playerName) {
      const updatedPlayers = [...game.players, {
        id: playerId,
        name: playerName,
        vote: null,
        isHost
      }];
      await this.updatePlayers(gameId, updatedPlayers);
    } else if (existingPlayer) {
      // Update existing player's name and host status if needed
      const updatedPlayers = game.players.map(p => 
        p.id === playerId 
          ? { ...p, name: playerName || p.name, isHost: isHost || p.isHost }
          : p
      );
      await this.updatePlayers(gameId, updatedPlayers);
    }
  }

  async updatePlayerVote(gameId: string, playerId: string, vote: string | null): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        
        if (!gameDoc.exists()) {
          throw new Error('Game not found');
        }
        
        const game = gameDoc.data() as Game;
        const updatedPlayers = game.players.map(player => 
          player.id === playerId ? { ...player, vote } : player
        );
        
        transaction.update(gameRef, { 
          players: updatedPlayers,
          updatedAt: Timestamp.now()
        });
      });
    } catch (error) {
      console.error('Error in vote transaction:', error);
      throw new Error('Failed to update vote');
    }
  }

  async updatePlayers(gameId: string, players: Player[]): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      players,
      updatedAt: Timestamp.now()
    });
  }

  async updateGameState(gameId: string, updates: Partial<Game>): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async removePlayer(gameId: string, playerId: string): Promise<void> {
    const game = await this.getGame(gameId);
    const updatedPlayers = game.players.filter(p => p.id !== playerId);
    
    await this.updateGameState(gameId, {
      players: updatedPlayers
    });
  }

  async transferHost(gameId: string, newHostId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const game = gameDoc.data() as Game;
    const updatedPlayers = game.players.map(player => ({
      ...player,
      isHost: player.id === newHostId
    }));
    
    await updateDoc(gameRef, { 
      players: updatedPlayers,
      updatedAt: Timestamp.now()
    });
  }

  subscribeToGame(gameId: string): Observable<Game> {
    return new Observable(subscriber => {
      const gameRef = doc(db, 'games', gameId);
      return onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
          subscriber.next(doc.data() as Game);
        }
      }, (error) => {
        subscriber.error(error);
      });
    });
  }

  async revealVotes(gameId: string): Promise<void> {
    await this.updateGameState(gameId, { status: 'revealed' });
  }

  async resetVotes(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    const updatedPlayers = game.players.map(player => ({
      ...player,
      vote: null
    }));

    await this.updateGameState(gameId, {
      players: updatedPlayers,
      status: 'waiting'
    });
  }
}