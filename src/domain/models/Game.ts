import { Timestamp } from 'firebase/firestore';

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
  currentRound: number;
  status: 'waiting' | 'voting' | 'revealed';
  mostRepeatedVote: number | string | null;
  voteCounts: Record<string, number>;
  removedPlayers: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GameState {
  currentGame: Game | null;
  playerVotes: Map<string, number>;
  isHost: boolean;
}