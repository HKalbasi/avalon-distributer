import { Game } from '../types'

export const hashCode = (x: string) => {
  let hash = 0,
    i,
    chr
  if (x.length === 0) return hash
  for (i = 0; i < x.length; i++) {
    chr = x.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export const splitmix32 = (a: number) => {
  return () => {
    a |= 0
    a = (a + 0x9e3779b9) | 0
    let t = a ^ (a >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
  }
}

export const gameFromSeed = (seed: number, n: number, roles: string[]): Game | undefined => {
  const rng = splitmix32(seed)
  return {
    roles: roles
      .map(code => ({ code, order: rng() }))
      .sort((a, b) => a.order - b.order)
      .map(x => x.code),
    starter: Math.floor(rng() * n),
  }
}

export const getFinalHashOfGame = (players: string[], game: Game) => {
  const hashOfGame = hashCode(game.roles.join('#') + game.starter + players.join('$'))
  return Math.abs(hashOfGame).toString(16)
}

export function makeid(length: number) {
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
