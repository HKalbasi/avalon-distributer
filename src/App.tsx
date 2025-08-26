import { useState, useEffect, useMemo } from 'react'
import { IDetectedBarcode } from '@yudiel/react-qr-scanner'
import pako from 'pako'

// Components
import Dialog from './components/common/Dialog'
import PWABadge from './components/common/PWABadge'
import BuildInfo from './components/common/BuildInfo'
import Header from './components/layout/Header'
import UserInfo from './components/layout/UserInfo'
import FriendsManager from './components/friends/FriendsManager'
import QRCodeSection from './components/friends/QRCodeSection'
import GameSetup from './components/game/GameSetup'
import GameInfo from './components/game/GameInfo'
import GameHistory from './pages/GameHistory'
import InitialSetup from './pages/InitialSetup'

// Hooks
import { useDialog } from './hooks/useDialog'
import { useGameLogic } from './hooks/useGameLogic'

// Types and Utils
import { Friend, GameType, GameRecord, Commands } from './types'
import { normalizeName } from './utils/nameUtils'

function App() {
  // Dialog system
  const { dialogState, closeDialog, showSuccess, showInfo, showError, showWarning, confirm, prompt } = useDialog()

  // Initial setup state
  const [isInitialized, setIsInitialized] = useState(false)
  const [me, setMe] = useState('')

  // Initialize user
  useEffect(() => {
    const storedName = localStorage.getItem('me')
    if (storedName) {
      setMe(storedName)
      setIsInitialized(true)
    }
  }, [])

  const handleInitialSetup = (name: string) => {
    const normalizedName = normalizeName(name)
    localStorage.setItem('me', normalizedName)
    setMe(normalizedName)
    setIsInitialized(true)
  }

  // State
  const [showQR, setShowQR] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('friends') ?? '[]') as Array<Friend>)
  const [seed, setSeed] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [gameType, setGameType] = useState('Avalon' as GameType)

  // Computed values
  const players = [...friends.filter(f => f.is_in_game).map(f => f.name), me].sort()
  const { playersHash, game } = useGameLogic(players, gameType, seed)

  // Game serialization
  const gameSerializedBytes = pako.deflate(
    JSON.stringify([
      ...friends.filter(a => a.is_in_game),
      {
        name: me,
        is_in_game: true,
      },
    ]),
  )
  const gameSerialized = btoa(String.fromCharCode(...gameSerializedBytes))

  // Game history
  const gameHistory = useMemo(() => {
    return JSON.parse(localStorage.getItem('gameHistory') ?? '[]') as GameRecord[]
  }, [showHistory])

  // Friend management functions
  const setFriendsPermanent = async (x: Friend[], command: Commands) => {
    // Normalize all names first
    x.forEach(a => {
      a.name = normalizeName(a.name)
    })

    if (command == Commands.Add) {
      // Get all existing friend names (normalized)
      const existingFriendNames = friends.map(f => normalizeName(f.name))
      
      // Check for duplicates among the new friends being added
      const newFriendNames = x.filter(f => !existingFriendNames.includes(f.name)).map(f => f.name)
      
      // Check if any new friend name matches the current user
      const hasCurrentUser = newFriendNames.some(name => name === normalizeName(me))
      if (hasCurrentUser) {
        await showError('You cannot add yourself as a friend!')
        return
      }
      
      // Check for duplicates within the new list
      const uniqueNewNames = new Set(newFriendNames)
      if (uniqueNewNames.size !== newFriendNames.length) {
        await showError('Duplicate names in the list!')
        return
      }
      
      // Check if any new names already exist in friends list
      const duplicatesFound = newFriendNames.filter(name => existingFriendNames.includes(name))
      if (duplicatesFound.length > 0) {
        await showError(`These names already exist: ${duplicatesFound.join(', ')}`)
        return
      }
    } else if (command == Commands.Append) {
      const tmp: Friend[] = []
      const current_friends = localStorage.getItem('friends')

      if (current_friends) {
        const current_friends_list: Friend[] = JSON.parse(current_friends)
        current_friends_list.forEach(x => (x.is_in_game = false))

        // Import new friends into current friends
        for (const new_friend of x) {
          let exists = false
          for (const current_friend of current_friends_list) {
            if (normalizeName(new_friend.name) === normalizeName(current_friend.name)) {
              current_friend.is_in_game = new_friend.is_in_game
              exists = true
              break
            }
          }

          if (!exists && normalizeName(new_friend.name) !== normalizeName(me)) {
            tmp.push(new_friend)
          }
        }

        for (const a of tmp) {
          current_friends_list.push(a)
        }
        x = current_friends_list
      }
    }

    x.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })

    localStorage.setItem('friends', JSON.stringify(x))
    setFriends(x)
  }

  // Handler functions
  const handleChangeName = async () => {
    const confirmed = await confirm('Do you want to change your name? This will reset your current session.')
    if (confirmed) {
      const newName = await prompt(
        'Enter your new name:',
        'Change Name',
        'Your new name...',
        me
      )
      if (newName && newName !== me) {
        const normalizedName = normalizeName(newName)
        localStorage.setItem('me', normalizedName)
        setMe(normalizedName)
        await showSuccess('Name changed successfully!')
      }
    }
  }

  const handleAddFriend = async () => {
    const name = await prompt(
      'Enter friend\'s name:',
      'Add Friend',
      'Friend name...'
    )
    if (name) {
      const normalizedNewName = normalizeName(name)
      
      // Check if it's the current user
      if (normalizedNewName === normalizeName(me)) {
        await showError('You cannot add yourself as a friend!')
        return
      }
      
      // Check if already exists
      const alreadyExists = friends.some(f => normalizeName(f.name) === normalizedNewName)
      if (alreadyExists) {
        await showError('This friend already exists!')
        return
      }
      
      await setFriendsPermanent(
        [
          ...friends,
          {
            name: normalizedNewName,
            is_in_game: false,
          },
        ],
        Commands.Add,
      )
    }
  }

  const handleBatchAddFriends = async () => {
    const names = await prompt(
      'Enter multiple names separated by commas:',
      'Batch Add Friends',
      'John, Jane, Bob...'
    )
    if (names) {
      const nameList = names.split(',').map((n: string) => n.trim()).filter((n: string) => n.length > 0)
      const normalizedMe = normalizeName(me)
      const existingNormalizedNames = friends.map(f => normalizeName(f.name))
      
      // Process and validate each name
      const validNewFriends: Friend[] = []
      const duplicates: string[] = []
      const invalidNames: string[] = []
      
      for (const name of nameList) {
        const normalizedName = normalizeName(name)
        
        if (normalizedName === normalizedMe) {
          invalidNames.push(name + ' (yourself)')
        } else if (existingNormalizedNames.includes(normalizedName)) {
          duplicates.push(name)
        } else if (!validNewFriends.some(f => f.name === normalizedName)) {
          validNewFriends.push({ name: normalizedName, is_in_game: false })
        }
      }
      
      // Report issues if any
      if (duplicates.length > 0 || invalidNames.length > 0) {
        let errorMsg = ''
        if (duplicates.length > 0) {
          errorMsg += `Already exist: ${duplicates.join(', ')}\n`
        }
        if (invalidNames.length > 0) {
          errorMsg += `Invalid: ${invalidNames.join(', ')}`
        }
        await showWarning(errorMsg)
      }
      
      // Add valid new friends
      if (validNewFriends.length > 0) {
        setFriendsPermanent([...friends, ...validNewFriends], Commands.Add)
        await showSuccess(`Added ${validNewFriends.length} new friends!`)
      } else if (duplicates.length === 0 && invalidNames.length === 0) {
        await showInfo('No names to add.')
      }
    }
  }

  const handleToggleFriend = (friendName: string) => {
    setFriendsPermanent(
      friends.map((f) => (f.name === friendName ? { ...f, is_in_game: !f.is_in_game } : f)),
      Commands.Toggle,
    )
  }

  const handleRemoveFriend = async (friendName: string) => {
    const confirmed = await confirm(`Remove ${friendName} from friends?`)
    if (confirmed) {
      setFriendsPermanent(
        friends.filter(f => f.name !== friendName),
        Commands.Remove,
      )
    }
  }

  const handleClearAll = () => {
    setFriendsPermanent(
      friends.map(f => ({ ...f, is_in_game: false })),
      Commands.Toggle,
    )
  }

  const handleClearHistory = async () => {
    const confirmed = await confirm('Clear all game history?', 'Clear History')
    if (confirmed) {
      localStorage.removeItem('gameHistory')
      setShowHistory(false)
      setTimeout(() => setShowHistory(true), 100) // Force re-render
      await showSuccess('Game history cleared!')
    }
  }

  const qrcodeGameImport = async (read_data: string) => {
    try {
      const compressed_byte_array = Uint8Array.from(atob(read_data), c => c.charCodeAt(0))
      const data = JSON.parse(pako.inflate(compressed_byte_array, { to: 'string' }))
      setFriendsPermanent(data, Commands.Append)
      await showSuccess('Friends imported successfully!')
    } catch (error) {
      console.error('Error importing data:', error)
      await showError('Failed to import QR code data')
    }
  }

  const handleScan = (result: IDetectedBarcode[]) => {
    if (isScanning) {
      if (result.length == 0) {
        return
      }

      qrcodeGameImport(result[0].rawValue)
      // Stop scanning after successful read
      setIsScanning(false)
    }
  }

  // Show initial setup if needed
  if (!isInitialized) {
    return <InitialSetup onComplete={handleInitialSetup} />
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto max-w-2xl px-4 py-6'>
        <Header gameType={gameType} onGameTypeChange={setGameType} />
        
        <UserInfo userName={me} onChangeName={handleChangeName} />

        {/* Quick Actions */}
        <div className='grid grid-cols-2 gap-3 mb-6'>
          <button 
            className='btn btn-custom-primary rounded-xl py-3'
            onClick={() => setShowFriends(!showFriends)}
          >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5 mr-2'>
              <path d='M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z' />
            </svg>
            {showFriends ? 'Hide' : 'Manage'} Friends
          </button>
          <button 
            className='btn btn-custom-secondary rounded-xl py-3'
            onClick={() => setShowHistory(!showHistory)}
          >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5 mr-2'>
              <path fillRule='evenodd' d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z' clipRule='evenodd' />
            </svg>
            Game History
          </button>
        </div>

        {/* Friends Management */}
        {showFriends && (
          <FriendsManager
            friends={friends}
            onAddFriend={handleAddFriend}
            onBatchAddFriends={handleBatchAddFriends}
            onToggleFriend={handleToggleFriend}
            onRemoveFriend={handleRemoveFriend}
            onClearAll={handleClearAll}
            onExportQR={() => setShowQR(!showQR)}
            onImportQR={() => setIsScanning(!isScanning)}
            isScanning={isScanning}
          />
        )}

        {/* QR Code Section */}
        <QRCodeSection
          showQR={showQR}
          gameSerialized={gameSerialized}
          isScanning={isScanning}
          onScan={handleScan}
        />

        {/* Game History */}
        {showHistory && (
          <GameHistory
            gameHistory={gameHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {/* Game Setup */}
        <GameSetup
          players={players}
          playersHash={playersHash}
          seed={seed}
          setSeed={setSeed}
          me={me}
        />

        {/* Game Information */}
        {game && seed && (
          <GameInfo
            game={game}
            gameType={gameType}
            players={players}
            me={me}
            seed={seed}
          />
        )}

        {/* No Game State */}
        {(!game || !seed) && players.length >= 5 && (
          <div className='bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-blue-700'>
            <p className='font-medium'>Generate a game seed to start!</p>
          </div>
        )}

        {/* Not Enough Players */}
        {players.length < 5 && (
          <div className='bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-orange-700'>
            <p className='font-medium'>You need at least 5 players to start a game</p>
          </div>
        )}

        {/* Footer */}
        <footer className='text-center mt-8 pb-4'>
          <BuildInfo />
        </footer>
      </div>

      {/* Dialog Component */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        placeholder={dialogState.placeholder}
        defaultValue={dialogState.defaultValue}
      />

      <PWABadge />
    </div>
  )
}

export default App