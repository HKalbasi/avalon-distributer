import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Scanner } from '@yudiel/react-qr-scanner';
import PWABadge from './PWABadge.tsx'
import BuildInfo from './BuildInfo.tsx'
import './App.css'

type Friend = {
  name: string;
  is_in_game: boolean;
};

const hashCode = (x: string) => {
  let hash = 0, i, chr;
  if (x.length === 0) return hash;
  for (i = 0; i < x.length; i++) {
    chr = x.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const splitmix32 = (a: number) => {
  return () => {
    a |= 0;
    a = a + 0x9e3779b9 | 0;
    let t = a ^ a >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
};

type Game = {
  roles: string[];
  starter: number;
}


const rolesPerPlayerCount: { [x: number]: string[] | undefined } = {
  6: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Servant",
    "Servant",
  ],
  7: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Servant",
    "Servant",
  ],
  8: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Servant",
    "Servant",
    "Servant",
  ],
  9: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Servant",
    "Servant",
    "Servant",
    "Servant",
  ],
  10: [
    "Merlin",
    "Persival",
    "Mordred",
    "Morgana",
    "Assassin",
    "Minion",
    "Servant",
    "Servant",
    "Servant",
    "Servant",
  ],
}

const bads = ["Mordred", "Morgana", "Assassin", "Minion"];

const gameFromSeed = (seed: number, n: number): Game | undefined => {
  const roles = rolesPerPlayerCount[n];
  if (!roles) {
    return;
  }
  const rng = splitmix32(seed);
  return {
    roles: roles.map(code => ({ code, order: rng() })).sort((a, b) => a.order - b.order).map(x => x.code),
    starter: Math.floor(rng() * n),
  }
}

const renderGameFor = (me: number, players: string[], game: Game) => {
  const hashOfGame = hashCode(game.roles.join('#') + game.starter + players.join('$'));
  const isBad = bads.includes(game.roles[me]);
  return (
    <div>
      <div>
        You are: {game.roles[me]}
      </div>
      {isBad && <div>
        Your team: <ul>
          {game.roles.find((r) => r === "Mordred") && <li>Mordred: {players[game.roles.findIndex((r) => r === 'Mordred')]}</li>}
          {game.roles.find((r) => r === "Morgana") && <li>Morgana: {players[game.roles.findIndex((r) => r === 'Morgana')]}</li>}
          {game.roles.find((r) => r === "Assassin") && <li>Assassin: {players[game.roles.findIndex((r) => r === 'Assassin')]}</li>}
          {game.roles.find((r) => r === "Minion") && <li>Minion: {players[game.roles.findIndex((r) => r === 'Minion')]}</li>}
        </ul>
      </div>}
      {game.roles[me] === "Merlin" && <div>
        Bads you know: <ul>
          {game.roles.map((role, i) => (
            bads.includes(role) && role !== "Mordred" && <li key={i}>
              {players[i]}
            </li>
          ))}
        </ul>
      </div>}
      {game.roles[me] === "Persival" && <div>
        You know: <ul>
          {game.roles.map((role, i) => (
            (role === "Merlin" || role === "Morgana") && <li key={i}>
              {players[i]}
            </li>
          ))}
        </ul>
        As merlin and morgana but you don't know kodoom kodoome
      </div>}
      {game.roles[me] === "Servant" && <div>
        You know nothing, but pretend you are reading name of your team or
        name of bads or name of merlin and morgana.
      </div>}
      <div>
        Don't look at faces immediately
      </div>
      <div>
        Starter: {players[game.starter]}
      </div>
      <div>
        Final hash of game: {Math.abs(hashOfGame).toString(16)}
      </div>
    </div>
  )
};

function makeid(length: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const normalizeName = (name: string): string => {
  return name.toLowerCase().trim();
};

const getMe = (): string => {

  const permanentName = (name: string) => {
    name = normalizeName(name);
    localStorage.setItem('me', name);
  };

  let name = localStorage.getItem('me');
  if (name) {
    // To make sure the name is stored in standard/normalized format.
    permanentName(name);
    return name;
  }
  name = window.prompt('Name?') ?? "gav";
  permanentName(name);
  return name;
};

const hasDuplicate = (list: string[]): boolean => {
  const set = new Set(list);
  return set.size !== list.length;
};

function App() {
  // Showing/Exporting QRCode
  const [showQR, setShowQR] = useState(false);

  // Scanning/Reading QRCode
  const [isScanning, setIsScanning] = useState(false);

  enum Commands {
    Add = 1,
    Remove,
    Toggle,
    Append
  }

  const setFriendsPermanent = (x: Friend[], command: Commands) => {
    console.log("before x : ", x);
    x.forEach(a => {a.name = normalizeName(a.name)});
    console.log("after x : ", x);

    if (command == Commands.Add)
    {
      if (hasDuplicate([...x.map(n => n.name), getMe()]))
        return;
    }
    else if (command == Commands.Append) {
      console.log("first x : ", x);

      const tmp: Friend[] = [];

      const current_friends = localStorage.getItem('friends');

      if (current_friends) {

        const current_friends_list: Friend[] = JSON.parse(current_friends);
        current_friends_list.forEach(x=>x.is_in_game=false)

        // Import new friends into current friends
        for (const new_friend of x) {
          let exists = false
          for (const current_friend of current_friends_list) {
            if (new_friend.name === current_friend.name) {
              current_friend.is_in_game = new_friend.is_in_game
              exists = true;
              break;
            }
          }

          if (!exists)
            tmp.push(new_friend);
        }

        for (const a of tmp) {
          current_friends_list.push(a);
        }
        x = current_friends_list
      }
    }

    x.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    localStorage.setItem('friends', JSON.stringify(x));
    setFriends(x);
  };

  const qrcodeGameExport = () => {
    try {
      JSON.stringify({
        players: [...friends.filter(f => f.is_in_game), { name: me, is_in_game: true }],
        seed: seed
      });
      setShowQR(!showQR);
    } catch (error) {
      console.error('Error generating game data:', error);
      alert('Error generating export data');
    }
  };

  const qrcodeGameImport = (read_data: string) => {
    const data = JSON.parse(read_data);
    setFriendsPermanent(data, Commands.Append);
  };

  const handleScan = (result: string) => {
    if (isScanning) {
      qrcodeGameImport(result);
      // Stop scanning after successful read
      setIsScanning(false);
    }
  };


  const me = getMe();

  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('friends') ?? "[]") as Array<Friend>);
  const [seed, setSeed] = useState("");


  const players = [...friends.filter(f => f.is_in_game).map(f => f.name), me].sort();

  // sha256 of players to ensure game is same for every one
  const playersHash = hashCode(players.join('#'));

  const seedHash = hashCode(seed);

  const game = gameFromSeed(seedHash, players.length);

  return (
    <>
      <h1>Avalon</h1>
      <div>
        I am: {me}
      </div>
      <div>
        Friends list:
        <ul>
          {friends.map((friend, i) => (
            <li key={i}>
              {friend.name}
              <button onClick={() => setFriendsPermanent(friends.map((f, j) => i === j ? { ...f, is_in_game: !f.is_in_game } : f), Commands.Toggle)}>
                {friend.is_in_game ? "Leave" : "Join"}
              </button>
              <button onClick={() => setFriendsPermanent(friends.filter((_, j) => i !== j), Commands.Remove)}>
                Remove
              </button>
            </li>
          ))}
          <button onClick={() => setFriendsPermanent([...friends, { name: window.prompt('Name?') ?? "gav", is_in_game: false }], Commands.Add)}>
            Add friend
          </button>
        </ul>
      </div>
      <div>
        Current game:
        <br />
        Number of players: {players.length}
        <br />
        Players: {players.join(', ')}
        <br />
        Hash of players: {Math.abs(playersHash).toString(16)}
        <br />
        <span onClick={() => setSeed(makeid(4))}>Game seed:</span>
        <input type="text" value={seed} onChange={e => setSeed(e.target.value)} />
        {/* QR Code Export Section */}
        <div>
          <button onClick={qrcodeGameExport}>
            Export Game Information
          </button>
          {/* Add QR Code display */}
          {showQR && <QRCode
            value={JSON.stringify([...friends, { name: me, is_in_game: true }])}
            size={128}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
          />}
        </div>
        {/* QR Code Import Section */}
        <div>
          <button onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>

          {isScanning && (
            <Scanner
              onScan={handleScan}
              enabled={isScanning}
              sound={false}
            />
          )}
        </div>
      </div>
      {game && renderGameFor(players.findIndex((x) => x === me), players, game)}
      <PWABadge />
      <BuildInfo />
    </>
  )
}

export default App
