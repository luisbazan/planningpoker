import { Timestamp } from 'firebase/firestore';

export interface Player {
  id: string;
  name: string;
  vote: string | null;
  isHost: boolean;
  isRemoved: boolean;
  joinedAt: any; // Using 'any' temporarily for Firestore Timestamp
}

export interface Game {
  id: string;
  hostId: string;
  status: 'waiting' | 'voting' | 'revealed';
  players: Player[];
  removedPlayers: Player[];
  currentRound: number;
  mostRepeatedVote: string | null;
  voteCounts: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GameState {
  currentGame: Game | null;
  playerVotes: Map<string, number>;
  isHost: boolean;
}