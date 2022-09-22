export enum Color {
  White = 'white',
  Black = 'black',
}

export type User = {
  username: string;
  id: number;
};

export interface Move {
  from: string;
  to: string;
  uci: string;
}
