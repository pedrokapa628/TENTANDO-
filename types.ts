
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameState {
  history: { role: 'user' | 'model'; text: string }[];
  currentScene: string;
  statusUpdate: string;
  suggestedActions: string[];
  currentImageBase64: string | null;
  inventory: string[];
  health: number;
  location: string;
  turnCount: number;
  score: number;
  difficulty: Difficulty;
}

export interface AIResponse {
  sceneDescription: string;
  statusUpdate: string;
  actions: string[];
  imagePrompt: string;
  newInventoryItems?: string[];
  healthChange?: number;
  scoreChange?: number;
  locationName: string;
}

export enum GameStage {
  START = 'START',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  LOADING = 'LOADING'
}
