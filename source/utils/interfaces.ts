export interface Stream {
  div: HTMLElement;
  isFavorite?: boolean;
  url?: string;
  channel?: string;
  game?: string;
  viewers: number;
  currentPosition?: number;
}
