export type Friend = {
  name: string
  is_in_game: boolean
}

export type GameType = 'Avalon' | 'Secret Hitler'

export type Game = {
  roles: string[]
  starter: number
}

export interface GameRecord {
  id: string
  date: string
  gameType: GameType
  players: string[]
  winner: string
  seed: string
}

export enum Commands {
  Add = 1,
  Remove,
  Toggle,
  Append,
}
