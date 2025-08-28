import { GameType } from '../../types'

interface HeaderProps {
  gameType: GameType
  onGameTypeChange: (type: GameType) => void
}

const Header = ({ gameType, onGameTypeChange }: HeaderProps) => {
  return (
    <header className='mb-8 text-center'>
      <h1
        className='text-5xl font-bold cursor-pointer transition-all hover:scale-105 mb-2'
        style={{ color: '#2c3e50' }}
        onClick={() => onGameTypeChange(gameType === 'Avalon' ? 'Secret Hitler' : 'Avalon')}
      >
        {gameType}
      </h1>
      <p className='text-[#bdc3c7] text-sm'>Tap title to switch game</p>
    </header>
  )
}

export default Header