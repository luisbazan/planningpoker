import { ref, onUnmounted } from 'vue';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Game, Player } from '@/domain/models/Game';
import { Observable } from 'rxjs';
import { firebaseConfig } from '../../firebase.config';
import { db } from '../../firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

export class GameRepository {
  private gamesCollection = collection(dbFirestore, 'games');

  async createGame(gameId: string, hostId: string, hostName: string): Promise<void> {
    const now = Timestamp.now();
    const newGame: Game = {
      id: gameId,
      hostId: hostId,
      status: 'waiting',
      players: [{
        id: hostId,
        name: hostName,
        isHost: true,
        vote: null,
        isRemoved: false,
        joinedAt: now
      }],
      removedPlayers: [],
      currentRound: 1,
      mostRepeatedVote: null,
      voteCounts: {},
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(this.gamesCollection, gameId), newGame);
  }

  async getGame(gameId: string): Promise<Game | null> {
    const gameDoc = await getDoc(doc(this.gamesCollection, gameId));
    return gameDoc.exists() ? gameDoc.data() as Game : null;
  }

  async addPlayer(gameId: string, playerId: string, playerName: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const game = await this.getGame(gameId);
    
    if (!game) {
      throw new Error('Game not found');
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      vote: null,
      isRemoved: false,
      joinedAt: Timestamp.now()
    };

    await updateDoc(gameRef, {
      players: arrayUnion(newPlayer),
      updatedAt: Timestamp.now()
    });
  }

  async reconnectPlayer(gameId: string, playerId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const game = await this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const players = [...game.players];
    const playerIndex = players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    players[playerIndex] = {
      ...players[playerIndex],
      isRemoved: false
    };

    await updateDoc(gameRef, {
      players,
      updatedAt: Timestamp.now()
    });
  }

  async removePlayer(gameId: string, playerId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const game = await this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const players = [...game.players];
    const playerIndex = players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    players[playerIndex] = {
      ...players[playerIndex],
      isRemoved: true,
      vote: null
    };

    await updateDoc(gameRef, {
      players,
      updatedAt: Timestamp.now()
    });
  }

  async transferHost(gameId: string, newHostId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const game = await this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const players = game.players.map(player => ({
      ...player,
      isHost: player.id === newHostId
    }));

    await updateDoc(gameRef, {
      players,
      updatedAt: Timestamp.now()
    });
  }

  async submitVote(gameId: string, playerId: string, vote: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const game = await this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const players = game.players.map(player => 
      player.id === playerId ? { ...player, vote } : player
    );

    await updateDoc(gameRef, {
      players,
      updatedAt: Timestamp.now()
    });
  }

  async revealVotes(gameId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    await updateDoc(gameRef, {
      status: 'revealed',
      updatedAt: Timestamp.now()
    });
  }

  async startNewRound(gameId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const game = await this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const players = game.players.map(player => ({
      ...player,
      vote: null
    }));

    await updateDoc(gameRef, {
      players,
      status: 'waiting',
      currentRound: game.currentRound + 1,
      mostRepeatedVote: null,
      voteCounts: {},
      updatedAt: Timestamp.now()
    });
  }

  async updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  subscribeToGame(gameId: string): Observable<Game> {
    return new Observable(subscriber => {
      const gameRef = doc(this.gamesCollection, gameId);
      return onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
          subscriber.next(doc.data() as Game);
        }
      });
    });
  }
}