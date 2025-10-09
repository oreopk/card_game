export type CardType = "nishchiy" | "bogach";

export interface TypeCard {
  id: string;
  x: number;
  y: number;
  type: CardType;
}

export interface CardContainer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}