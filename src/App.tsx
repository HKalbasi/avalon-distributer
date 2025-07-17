import { useState } from 'react'
import QRCode from 'react-qr-code'
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import PWABadge from './PWABadge.tsx'
import BuildInfo from './BuildInfo.tsx'
import pako from 'pako'
import EncryptGameInfo from './EncryptGameInfo.tsx'

type Friend = {
  name: string
  is_in_game: boolean
}

type GameType = 'Avalon' | 'Secret Hitler'

const hashCode = (x: string) => {
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

const splitmix32 = (a: number) => {
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

type Game = {
  roles: string[]
  starter: number
}

const rolesPerPlayerCountAvalon: { [x: number]: string[] | undefined } = {
  5: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Servant'],
  6: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Servant', 'Servant'],
  7: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Servant', 'Servant'],
  8: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Servant', 'Servant', 'Servant'],
  9: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Servant', 'Servant', 'Servant', 'Servant'],
  10: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Minion', 'Servant', 'Servant', 'Servant', 'Servant'],
}

const rolesPerPlayerCountHitler: { [x: number]: string[] | undefined } = {
  5: ['Adolf Hitler', 'Fascist', 'Liberal', 'Liberal', 'Liberal'],
  6: ['Adolf Hitler', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal'],
  7: ['Adolf Hitler', 'Fascist', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal'],
  8: ['Adolf Hitler', 'Fascist', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal'],
  9: ['Adolf Hitler', 'Fascist', 'Fascist', 'Fascist', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal'],
  10: [
    'Adolf Hitler',
    'Fascist',
    'Fascist',
    'Fascist',
    'Liberal',
    'Liberal',
    'Liberal',
    'Liberal',
    'Liberal',
    'Liberal',
  ],
}

const bads = ['Mordred', 'Morgana', 'Assassin', 'Minion']

const gameFromSeed = (seed: number, n: number, roles: string[]): Game | undefined => {
  const rng = splitmix32(seed)
  return {
    roles: roles
      .map(code => ({ code, order: rng() }))
      .sort((a, b) => a.order - b.order)
      .map(x => x.code),
    starter: Math.floor(rng() * n),
  }
}

const getFinalHashOfGame = (players: string[], game: Game) => {
  const hashOfGame = hashCode(game.roles.join('#') + game.starter + players.join('$'))
  return Math.abs(hashOfGame).toString(16)
}

const renderGameForAvalon = (me: number, players: string[], game: Game) => {
  const isBad = bads.includes(game.roles[me])
  return (
    <div className='flex flex-col gap-5'>
      <div>
        Final hash of game: <span className='text-warning'>{getFinalHashOfGame(players, game)}</span>
      </div>
      <div>You are: {game.roles[me]}</div>
      {isBad && (
        <div>
          <p className='mb-2'>Your team</p>
          <div className='flex flex-col gap-1'>
            {game.roles.find(r => r === 'Mordred') && (
              <div>Mordred: {players[game.roles.findIndex(r => r === 'Mordred')]}</div>
            )}
            {game.roles.find(r => r === 'Morgana') && (
              <div>Morgana: {players[game.roles.findIndex(r => r === 'Morgana')]}</div>
            )}
            {game.roles.find(r => r === 'Assassin') && (
              <div>Assassin: {players[game.roles.findIndex(r => r === 'Assassin')]}</div>
            )}
            {game.roles.find(r => r === 'Minion') && (
              <div>Minion: {players[game.roles.findIndex(r => r === 'Minion')]}</div>
            )}
          </div>
        </div>
      )}
      {game.roles[me] === 'Merlin' && (
        <div>
          <p className='mb-2'>Bads you know</p>

          <div className='flex flex-col gap-1'>
            {game.roles.map((role, i) => bads.includes(role) && role !== 'Mordred' && <div key={i}>{players[i]}</div>)}
          </div>
        </div>
      )}
      {game.roles[me] === 'Persival' && (
        <div>
          You know:{' '}
          <ul>
            {game.roles.map((role, i) => (role === 'Merlin' || role === 'Morgana') && <li key={i}>{players[i]}</li>)}
          </ul>
          As merlin and morgana but you don't know kodoom kodoome
        </div>
      )}
      {game.roles[me] === 'Servant' && (
        <div>
          You know nothing, but pretend you are reading name of your team or name of bads or name of merlin and morgana.
        </div>
      )}
      <div>Starter: {players[game.starter]}</div>
    </div>
  )
}

const encryptGameInfoForAvalon = (players: string[], game: Game, seed: string) => {
  const playerRoleMap: Record<string, string> = {}
  players.forEach((player, idx) => {
    playerRoleMap[player] = game.roles[idx]
  })

  const gameInfoString = {
    players: playerRoleMap,
    game_info: {
      timestamp: Math.floor(new Date().getTime() / 1000),
      final_hash_of_game: getFinalHashOfGame(players, game),
      game_seed: seed,
      winner: '',
    },
  }

  return <EncryptGameInfo textToEncrypt={gameInfoString} />
}

const renderGameForHitler = (me: number, players: string[], game: Game) => {
  return (
    <div>
      <div>You are: {game.roles[me]}</div>
      {game.roles[me] == 'Fascist' && (
        <div>
          Your team:{' '}
          <ul>
            {game.roles
              .map((role, index) =>
                role === 'Fascist' && me != index ? <li key={index}>Fascist: {players[index]}</li> : null,
              )
              .filter(Boolean)}
            {game.roles.find(r => r === 'Adolf Hitler') && (
              <li>Adolf Hitler: {players[game.roles.findIndex(r => r === 'Adolf Hitler')]}</li>
            )}
          </ul>
        </div>
      )}
      {game.roles[me] == 'Liberal' && <div>LOOK HERE FOR A FEW SECONDS :))</div>}
      {game.roles[me] === 'Adolf Hitler' &&
        (() => {
          if (players.length < 7) {
            return game.roles
              .map((role, index) => (role === 'Fascist' ? <li key={index}>Fascist: {players[index]}</li> : null))
              .filter(Boolean)
          } else {
            return <div>LOOK HERE FOR A FEW SECONDS :))</div>
          }
        })()}
      <div>Starter: {players[game.starter]}</div>
      <div>Final hash of game: {getFinalHashOfGame(players, game)}</div>
    </div>
  )
}

const gameDict = {
  Avalon: {
    rolesPerPlayerCount: rolesPerPlayerCountAvalon,
    renderGame: renderGameForAvalon,
    encryptGameInfo: encryptGameInfoForAvalon,
  },
  'Secret Hitler': {
    rolesPerPlayerCount: rolesPerPlayerCountHitler,
    renderGame: renderGameForHitler,
    encryptGameInfo: null,
  },
}

function makeid(length: number) {
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

const normalizeName = (name: string): string => {
  return name.toLowerCase().trim()
}

const getMe = (): string => {
  const permanentName = (name: string) => {
    name = normalizeName(name)
    localStorage.setItem('me', name)
  }

  let name = localStorage.getItem('me')
  if (name) {
    // To make sure the name is stored in standard/normalized format.
    permanentName(name)
    return name
  }
  name = window.prompt('Name?') ?? 'gav'
  permanentName(name)
  return name
}

const hasDuplicate = (list: string[]): boolean => {
  const set = new Set(list)
  return set.size !== list.length
}

function App() {
  // Showing/Exporting QRCode
  const [showQR, setShowQR] = useState(false)

  // Scanning/Reading QRCode
  const [isScanning, setIsScanning] = useState(false)

  const me = getMe()

  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('friends') ?? '[]') as Array<Friend>)
  const [seed, setSeed] = useState('')

  enum Commands {
    Add = 1,
    Remove,
    Toggle,
    Append,
  }

  const setFriendsPermanent = (x: Friend[], command: Commands) => {
    x.forEach(a => {
      a.name = normalizeName(a.name)
    })

    if (command == Commands.Add) {
      if (hasDuplicate([...x.map(n => n.name), getMe()])) return
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
            if (new_friend.name === current_friend.name) {
              current_friend.is_in_game = new_friend.is_in_game
              exists = true
              break
            }
          }

          if (!exists && new_friend.name !== getMe()) {
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

  const qrcodeGameExport = () => {
    try {
      setShowQR(!showQR)
    } catch (error) {
      console.error('Error generating game data:', error)
      alert('Error generating export data')
    }
  }

  const qrcodeGameImport = (read_data: string) => {
    const compressed_byte_array = Uint8Array.from(atob(read_data), c => c.charCodeAt(0))

    const data = JSON.parse(pako.inflate(compressed_byte_array, { to: 'string' }))
    setFriendsPermanent(data, Commands.Append)
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

  const [gameType, setGameType] = useState('Avalon' as GameType)

  const players = [...friends.filter(f => f.is_in_game).map(f => f.name), me].sort()

  // sha256 of players to ensure game is same for every one
  const playersHash = hashCode(players.join('#'))

  const seedHash = hashCode(seed) + playersHash

  let game

  if (players.length in gameDict[gameType].rolesPerPlayerCount) {
    game = gameFromSeed(seedHash, players.length, gameDict[gameType].rolesPerPlayerCount[players.length]!)
  }

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

  const [showFriends, setShowFriends] = useState(false)

  return (
    <div className='container text-center px-10 pt-2'>
      <h1
        className='text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary border-b-2 border-primary/20'
        onClick={() => setGameType(gameType === 'Avalon' ? 'Secret Hitler' : 'Avalon')}
      >
        {gameType}
      </h1>
      <div className='flex justify-between items-center rounded-md mt-2 px-4 py-2 ro border-2 border-secondary/50'>
        <p>your name: {me}</p>
        <button onClick={() => alert('you are hacked... 😈')}>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='size-4'>
            <path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z' />
          </svg>
        </button>
      </div>

      <div className='my-4 border-b-2 border-primary/50 pb-2'>
        <div className='flex flex-col gap-3'>
          <button className='btn btn-primary btn-dash' onClick={() => setShowFriends(!showFriends)}>
            {showFriends ? `hide ypur friends` : `show ypur friends`}
          </button>
          {showFriends && (
            <>
              <button
                className='btn btn-secondary btn-dash'
                onClick={() =>
                  setFriendsPermanent(
                    [
                      ...friends,
                      {
                        name: window.prompt('Name?') ?? 'gav',
                        is_in_game: false,
                      },
                    ],
                    Commands.Add,
                  )
                }
              >
                Add new friend
              </button>
              {friends.map((friend, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center rounded-md px-4 py-2 ro border-2 ${friend.is_in_game ? 'border-secondary/60' : 'border-dashed border-secondary/20'}`}
                  onClick={() =>
                    setFriendsPermanent(
                      friends.map((f, j) => (i === j ? { ...f, is_in_game: !f.is_in_game } : f)),
                      Commands.Toggle,
                    )
                  }
                >
                  <p>{friend.name}</p>

                  <svg
                    onClick={e => {
                      e.stopPropagation() // Prevent the parent onClick from firing
                      setFriendsPermanent(
                        friends.filter((_, j) => i !== j),
                        Commands.Remove,
                      )
                    }}
                    className='size-6 fill-error'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                  >
                    <path
                      fill-rule='evenodd'
                      d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z'
                      clip-rule='evenodd'
                    />
                  </svg>
                </div>
              ))}
            </>
          )}

          <button className='btn btn-dash btn-secondary' onClick={qrcodeGameExport}>
            Export Game Information
          </button>
          {showQR && (
            <div className=' p-4 bg-white rounded-lg shadow-md flex justify-center items-center'>
              <QRCode
                value={gameSerialized}
                size={200}
                bgColor='#ffffff' // Explicit white background
                fgColor='#000000'
                level='Q'
              />
            </div>
          )}
          {/* QR Code Import Section */}
          <button className='btn btn-dash btn-primary' onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
          {isScanning && <Scanner onScan={handleScan} />}
          <button
            className='btn btn-secondary btn-dash'
            onClick={() =>
              setFriendsPermanent(
                friends.map(f => ({ ...f, is_in_game: false })),
                Commands.Toggle,
              )
            }
          >
            Leave All
          </button>
        </div>
      </div>

      <div className='flex flex-col gap-5'>
        <div className='text-xl'>Current game</div>
        <div className='text-md'>Number of players: {players.length}</div>
        <div>
          <p className='mb-1 text-md'>Players:</p>
          <div className='flex flex-wrap gap-2 '>
            {players.map(player => (
              <span
                onClick={() =>
                  setFriendsPermanent(
                    friends.map(f => (player === f.name ? { ...f, is_in_game: !f.is_in_game } : f)),
                    Commands.Toggle,
                  )
                }
                className='btn btn-dash'
              >
                {player}
              </span>
            ))}
          </div>
        </div>

        <div className='text-md'>
          <span>Hash of players: </span>
          <span className='text-warning'>{Math.abs(playersHash).toString(16)}</span>
        </div>

        <div className='join'>
          <button className='btn join-item' onClick={() => setSeed(makeid(4))}>
            Game seed
          </button>
          <input className='input join-item' type='text' value={seed} onChange={e => setSeed(e.target.value)} />
        </div>

        {game &&
          gameDict[gameType].renderGame(
            players.findIndex(x => x === me),
            players,
            game,
          )}

        {game && gameDict[gameType].encryptGameInfo?.(players, game, seed)}

        <BuildInfo />
      </div>

      <PWABadge />
    </div>
  )
}

export default App
