import { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  players: Player[];
  status: 'waiting' | 'revealed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Player {
  id: string;
  name: string;
  vote: string | number | null;
  isHost: boolean;
}

export interface GameData {
  status: 'waiting' | 'voting' | 'revealed';
  players: Player[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 