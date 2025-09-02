import { GameRecord } from '../types'

interface GameHistoryProps {
  gameHistory: GameRecord[]
  onClearHistory: () => void
}

const GameHistory = ({ gameHistory, onClearHistory }: GameHistoryProps) => {
  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20 animate-slide-in'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold text-[#2c3e50]'>Game History</h2>
        {gameHistory.length > 0 && (
          <button className='text-sm text-red-500 hover:text-red-600' onClick={onClearHistory}>
            Clear All
          </button>
        )}
      </div>
      {gameHistory.length === 0 ? (
        <p className='text-center text-[#bdc3c7] py-4'>No games played yet</p>
      ) : (
        <div className='space-y-2 max-h-64 overflow-y-auto'>
          {gameHistory.map(game => (
            <div key={game.id} className='bg-gray-50 rounded-xl p-4 border border-[#bdc3c7]/20'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-[#2c3e50]'>{game.gameType}</p>
                  <p className='text-sm text-[#bdc3c7]'>
                    {new Date(game.date).toLocaleDateString()} • {game.players.length} players
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    game.winner.includes('Good') || game.winner.includes('Liberal')
                      ? 'bg-[#1abc9c] text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {game.winner}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GameHistory
