import { Timestamp } from 'firebase/firestore';

export interface Player {
  id: string;
  name: string;
  vote: string | number | null;
  isHost: boolean;
}

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'voting' | 'revealed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GameState {
  currentGame: Game | null;
  playerVotes: Map<string, number>;
  isHost: boolean;
}