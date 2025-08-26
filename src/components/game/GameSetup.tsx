import PlayerBadge from './PlayerBadge'
import { makeid } from '../../utils/gameUtils'

interface GameSetupProps {
  players: string[]
  playersHash: number
  seed: string
  setSeed: (seed: string) => void
  me: string
}

const GameSetup = ({ players, playersHash, seed, setSeed, me }: GameSetupProps) => {
  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20'>
      <h2 className='text-xl font-bold text-[#2c3e50] mb-4'>Game Setup</h2>
      
      {/* Players Count */}
      <div className='bg-gradient-to-r from-[#1abc9c]/10 to-[#2c3e50]/10 rounded-xl p-6 mb-4'>
        <div className='text-center'>
          <p className='text-sm text-[#2c3e50]/70'>Players in Game</p>
          <p className='text-4xl font-bold text-[#2c3e50] my-2'>{players.length}</p>
          <p className='text-sm'>
            {players.length < 5 && <span className='text-orange-500'>Need at least 5 players</span>}
            {players.length >= 5 && players.length <= 10 && <span className='text-[#1abc9c]'>Ready to play!</span>}
            {players.length > 10 && <span className='text-red-500'>Too many players (max 10)</span>}
          </p>
        </div>
      </div>

      {/* Players List */}
      <div className='mb-4'>
        <p className='text-sm text-[#bdc3c7] mb-2'>Current Players</p>
        <div className='flex flex-wrap gap-2'>
          {players.map((player, idx) => (
            <PlayerBadge key={idx} name={player} isMe={player === me} />
          ))}
        </div>
      </div>

      {/* Players Hash */}
      <div className='bg-gray-50 rounded-xl p-4 mb-4'>
        <p className='text-xs text-[#bdc3c7]'>Players Hash</p>
        <p className='font-mono text-sm players-hash'>{Math.abs(playersHash).toString(16)}</p>
      </div>

      {/* Game Seed */}
      <div>
        <label className='text-sm text-[#2c3e50] font-medium mb-2 block'>Game Seed</label>
        <div className='flex gap-2'>
          <input 
            className='input input-bordered flex-1 bg-gray-50 border-[#bdc3c7]/30 focus:border-[#1abc9c]' 
            type='text' 
            placeholder='Enter seed or generate'
            value={seed} 
            onChange={e => setSeed(e.target.value)} 
          />
          <button 
            className='btn btn-custom-primary'
            onClick={() => setSeed(makeid(4))}
          >
            Generate
          </button>
        </div>
        <p className='text-xs text-[#bdc3c7] mt-2'>
          All players must use the same seed to get matching roles
        </p>
      </div>
    </div>
  )
}

export default GameSetup