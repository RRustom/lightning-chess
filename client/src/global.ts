export enum Color {
  White = 'white',
  Black = 'black',
}

export enum Outcome {
  WhiteWon = '1-0',
  BlackWon = '0-1',
  NoOutcome = '*',
}

export type User = {
  userName: string;
  id: number;
  picture: number;
};

export interface Move {
  from: string;
  to: string;
  uci: string;
}
