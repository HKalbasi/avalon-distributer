import { useMemo } from 'react'
import { GameType } from '../types'
import { hashCode, gameFromSeed } from '../utils/gameUtils'
import { rolesPerPlayerCountAvalon, rolesPerPlayerCountHitler } from '../utils/constants'

export const useGameLogic = (players: string[], gameType: GameType, seed: string) => {
  const playersHash = useMemo(() => hashCode(players.join('#')), [players])

  const game = useMemo(() => {
    if (!seed) return undefined

    const seedHash = hashCode(seed) + playersHash
    const rolesPerPlayerCount = gameType === 'Avalon' ? rolesPerPlayerCountAvalon : rolesPerPlayerCountHitler

    if (players.length in rolesPerPlayerCount) {
      return gameFromSeed(seedHash, players.length, rolesPerPlayerCount[players.length]!)
    }
    return undefined
  }, [seed, playersHash, players.length, gameType])

  return { playersHash, game }
}
