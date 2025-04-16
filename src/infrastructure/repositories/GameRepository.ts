import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
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
      mostRepeatedVote: null,
      voteCounts: {},
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

  async updatePlayerVote(gameId: string, playerId: string, vote: number | string | null): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const game = gameDoc.data() as Game;
    const updatedPlayers = game.players.map(player => 
      player.id === playerId ? { ...player, vote } : player
    );

    await updateDoc(gameRef, {
      players: updatedPlayers,
      updatedAt: new Date()
    });
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

  async revealVotes(gameId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data();
    const players = gameData.players || [];

    // Calculate the most repeated vote
    const voteCounts: Record<string, number> = {};
    players.forEach((player: Player) => {
      if (player.vote !== null && player.vote !== undefined) {
        const voteKey = String(player.vote);
        voteCounts[voteKey] = (voteCounts[voteKey] || 0) + 1;
      }
    });

    let mostRepeatedVote: number | string | null = null;
    let maxCount = 0;

    Object.entries(voteCounts).forEach(([vote, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostRepeatedVote = vote;
      }
    });

    await updateDoc(gameRef, {
      isRevealEnabled: true,
      mostRepeatedVote: mostRepeatedVote,
      voteCounts: voteCounts
    });
  }

  async nextRound(gameId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data();
    const players = gameData.players || [];

    // Reset votes for all players except the host
    const updatedPlayers = players.map((player: Player) => ({
      ...player,
      vote: null
    }));

    await updateDoc(gameRef, {
      isRevealEnabled: false,
      mostRepeatedVote: null,
      voteCounts: {},
      players: updatedPlayers
    });
  }
}