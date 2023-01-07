import { Track } from "./playlist";


export enum Mode {
  NONE = "None",
  STANDARD = "Standard",
  BLITZ = "Blitz",
  REHEARSAL = "Rehearsal",
}

export interface GameSettings {
  initialTime: Record<Mode, number>;
  wordLimit: Record<Mode, number>;
  answersTime: number;
}

export interface Lyrics {
  song: Track;
  words: Record<string, number>
}

export interface WordData {
  word: string;
  frequency: number;
  songs: Track[];
}

export interface HistoryEntry {
  word: WordData;
  solved: boolean;
}

export enum GameState {
  None = "None",
  GUESSING = "Guessing",
  ANSWERS = "Answer",
  END = "End",
  REVIEW = "Review",
}

export interface State {
  mode: Mode;
  state: GameState;
  activeWord: WordData;
  history: HistoryEntry[];
  typing: boolean;
  paused: boolean;
}
export const DEFAULT_STATE = (): State => {
  return {
    state: GameState.None,
    mode: Mode.NONE,
    history: [],
    activeWord: { word: "", frequency: 0, songs: [] },
    typing: false,
    paused: false,
  }
}
