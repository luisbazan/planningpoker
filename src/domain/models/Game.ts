export interface Player {
  id: string;
  name: string;
  vote: number | null;
  isReady: boolean;
  isHost: boolean;
}

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  currentRound: number;
  isRevealEnabled: boolean;
  status: 'waiting' | 'active' | 'finished';
  createdAt: Date;
  updatedAt: Date;
}

export interface GameState {
  currentGame: Game | null;
  playerVotes: Map<string, number>;
  isHost: boolean;
}