export interface User {
  id: string;
  username: string;
  score: number;
}

export interface MathQuestion {
  question: string;
  answer: number;
}

export interface HighScore {
  username: string;
  score: number;
  timestamp: Date;
}

export interface GameState {
  currentQuestion: MathQuestion | null;
  users: User[];
  winner: User | null;
  gameStatus: "waiting" | "active" | "scoring";
  message: string;
}
