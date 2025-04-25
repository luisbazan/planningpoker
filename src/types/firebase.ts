import { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  players: Player[];
  status: 'waiting' | 'revealed';
  removedPlayers: string[]; // IDs de jugadores expulsados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Player {
  id: string;
  name: string;
  vote: string | null;
  isHost: boolean;
}

export interface GameData {
  status: 'waiting' | 'voting' | 'revealed';
  players: Player[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 