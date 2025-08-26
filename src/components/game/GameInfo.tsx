import { Game, GameType } from '../../types'
import { roleDescriptions, bads } from '../../utils/constants'
import { getFinalHashOfGame } from '../../utils/gameUtils'
import RoleCard from './RoleCard'
import PlayerBadge from './PlayerBadge'
import EncryptGameInfo from './EncryptGameInfo'

interface GameInfoProps {
  game: Game
  gameType: GameType
  players: string[]
  me: string
  seed: string
}

const GameInfo = ({ game, gameType, players, me, seed }: GameInfoProps) => {
  const myIndex = players.findIndex(x => x === me)
  const myRole = game.roles[myIndex]
  const isBad = gameType === 'Avalon' ? bads.includes(myRole) : (myRole === 'Fascist' || myRole === 'Adolf Hitler')

  const renderAvalonInfo = () => (
    <>
      {isBad && (
        <div className='bg-red-50 rounded-2xl p-6 border-2 border-red-200 animate-slide-in'>
          <h4 className='font-bold mb-4 text-red-700 text-lg'>Your Evil Team</h4>
          <div className='space-y-3'>
            {game.roles.map((role, idx) => 
              bads.includes(role) && (
                <div key={idx} className='flex justify-between items-center bg-white rounded-xl px-4 py-3 shadow-sm'>
                  <span className='font-medium text-[#2c3e50]'>{role}</span>
                  <span className='text-[#2c3e50]/70'>{players[idx]}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
      
      {myRole === 'Merlin' && (
        <div className='bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 animate-slide-in'>
          <h4 className='font-bold mb-4 text-blue-700 text-lg'>Evil Players You See</h4>
          <p className='text-sm text-blue-600 mb-3'>Remember: Mordred is hidden from you!</p>
          <div className='flex flex-wrap gap-2'>
            {game.roles.map((role, i) => 
              bads.includes(role) && role !== 'Mordred' && (
                <PlayerBadge key={i} name={players[i]} />
              )
            )}
          </div>
        </div>
      )}
      
      {myRole === 'Percival' && (
        <div className='bg-purple-50 rounded-2xl p-6 border-2 border-purple-200 animate-slide-in'>
          <h4 className='font-bold mb-4 text-purple-700 text-lg'>Merlin & Morgana</h4>
          <p className='text-sm text-purple-600 mb-3'>One is good, one is evil - but which is which?</p>
          <div className='flex flex-wrap gap-2'>
            {game.roles.map((role, i) => 
              (role === 'Merlin' || role === 'Morgana') && (
                <PlayerBadge key={i} name={players[i]} />
              )
            )}
          </div>
        </div>
      )}
      
      {myRole === 'Servant' && (
        <div className='bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200 animate-slide-in'>
          <p className='text-emerald-700'>
            You are a loyal servant of Arthur. Pretend to read information to avoid suspicion!
          </p>
          <div className='mt-4 p-4 bg-white rounded-xl'>
            <p className='text-sm text-[#2c3e50]/50 italic'>Look at your screen for 5-10 seconds...</p>
          </div>
        </div>
      )}
    </>
  )

  const renderHitlerInfo = () => (
    <>
      {myRole === 'Fascist' && (
        <div className='bg-red-50 rounded-2xl p-6 border-2 border-red-200 animate-slide-in'>
          <h4 className='font-bold mb-4 text-red-700 text-lg'>Your Fascist Team</h4>
          <div className='space-y-3'>
            {game.roles.map((role, index) =>
              role === 'Fascist' && myIndex !== index ? (
                <div key={index} className='bg-white rounded-xl px-4 py-3 shadow-sm'>
                  <span className='text-[#2c3e50]/70'>Fascist: {players[index]}</span>
                </div>
              ) : null
            ).filter(Boolean)}
            {game.roles.find(r => r === 'Adolf Hitler') && (
                            <div className='bg-white rounded-xl px-4 py-3 shadow-sm border-2 border-red-300'>
                <span className='font-bold text-red-600'>Hitler: {players[game.roles.findIndex(r => r === 'Adolf Hitler')]}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {myRole === 'Liberal' && (
        <div className='bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 animate-slide-in'>
          <p className='text-blue-700'>
            You are a Liberal. Look at this screen for a few seconds to maintain secrecy.
          </p>
          <div className='mt-4 p-4 bg-white rounded-xl'>
            <p className='text-sm text-[#2c3e50]/50 italic'>Pretending to read team information...</p>
          </div>
        </div>
      )}
      
      {myRole === 'Adolf Hitler' && (
        <div className='bg-red-50 rounded-2xl p-6 border-2 border-red-200 animate-slide-in'>
          {players.length < 7 ? (
            <>
              <h4 className='font-bold mb-4 text-red-700 text-lg'>Your Fascist Team</h4>
              <div className='space-y-3'>
                {game.roles.map((role, index) => 
                  role === 'Fascist' ? (
                    <div key={index} className='bg-white rounded-xl px-4 py-3 shadow-sm'>
                      <span className='text-[#2c3e50]/70'>Fascist: {players[index]}</span>
                    </div>
                  ) : null
                ).filter(Boolean)}
              </div>
            </>
          ) : (
            <>
              <p className='text-red-700 font-bold'>You are Hitler!</p>
              <p className='text-red-600 mt-2'>In games with 7+ players, you don't know your fascists.</p>
              <div className='mt-4 p-4 bg-white rounded-xl'>
                <p className='text-sm text-[#2c3e50]/50 italic'>Look at this screen for a few seconds...</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20'>
      <h2 className='text-xl font-bold text-[#2c3e50] mb-6'>Your Game Information</h2>
      
      <div className='space-y-6'>
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-[#bdc3c7]/30'>
          <p className='text-sm text-[#2c3e50]/70 mb-1'>Game Hash</p>
          <p className='font-mono text-lg game-hash'>{getFinalHashOfGame(players, game)}</p>
        </div>
        
        <RoleCard 
          role={myRole} 
          description={roleDescriptions[myRole as keyof typeof roleDescriptions]}
          isEvil={isBad}
        />

        {gameType === 'Avalon' ? renderAvalonInfo() : renderHitlerInfo()}
        
        <div className='bg-[#2c3e50] text-white rounded-2xl p-6 shadow-lg'>
          <p className='text-sm opacity-70 mb-1'>{gameType === 'Avalon' ? 'First Leader' : 'First President'}</p>
          <p className='text-xl font-bold'>{players[game.starter]}</p>
        </div>
      </div>

      {gameType === 'Avalon' && (
        <div className='mt-6'>
          <EncryptGameInfo 
            textToEncrypt={{
              players: Object.fromEntries(players.map((player, idx) => [player, game.roles[idx]])),
              game_info: {
                timestamp: Math.floor(new Date().getTime() / 1000),
                final_hash_of_game: getFinalHashOfGame(players, game),
                game_seed: seed,
                winner: '',
              },
            }}
          />
        </div>
      )}
    </div>
  )
}

export default GameInfo