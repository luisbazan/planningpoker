import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Player {
  id: string;
  name: string;
  vote: string | null;
  isHost: boolean;
}

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'voting' | 'revealed';
  createdAt: number;
}

export const createGame = async (gameId: string, hostName: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const newGame: Game = {
    id: gameId,
    hostId: gameId,
    players: [{
      id: gameId,
      name: hostName,
      vote: null,
      isHost: true
    }],
    status: 'waiting',
    createdAt: Date.now()
  };
  
  await setDoc(gameRef, newGame);
};

export const joinGame = async (gameId: string, playerName: string): Promise<string> => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);
  
  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }
  
  const game = gameDoc.data() as Game;
  const playerId = crypto.randomUUID();
  
  const updatedPlayers = [...game.players, {
    id: playerId,
    name: playerName,
    vote: null,
    isHost: false
  }];
  
  await updateDoc(gameRef, { players: updatedPlayers });
  return playerId;
};

export const submitVote = async (gameId: string, playerId: string, vote: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);
  
  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }
  
  const game = gameDoc.data() as Game;
  const updatedPlayers = game.players.map(player => 
    player.id === playerId ? { ...player, vote } : player
  );
  
  await updateDoc(gameRef, { players: updatedPlayers });
};

export const updatePlayers = async (gameId: string, players: Player[]): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, { players });
};

export const revealVotes = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, { status: 'revealed' });
};

export const resetVotes = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);
  
  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }
  
  const game = gameDoc.data() as Game;
  const updatedPlayers = game.players.map(player => ({
    ...player,
    vote: null
  }));
  
  await updateDoc(gameRef, {
    players: updatedPlayers,
    status: 'waiting'
  });
};

export const getGame = async (gameId: string): Promise<Game | null> => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);
  
  if (!gameDoc.exists()) {
    return null;
  }
  
  return gameDoc.data() as Game;
};

export const subscribeToGame = (
  gameId: string,
  onUpdate: (game: Game) => void,
  onError: (error: Error) => void
): (() => void) => {
  const gameRef = doc(db, 'games', gameId);
  
  return onSnapshot(
    gameRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Game);
      }
    },
    onError
  );
}; 