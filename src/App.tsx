import { useState } from 'react'
import PWABadge from './PWABadge.tsx'
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

const getMe = (): string => {
  const me = localStorage.getItem('me');
  if (me) {
    return me;
  }
  const name = window.prompt('Name?') ?? "gav";
  localStorage.setItem('me', name);
  return name;
};

function App() {
  const me = getMe();

  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('friends') ?? "[]") as Array<Friend>)
  const [seed, setSeed] = useState("");

  const setFriendsPermanent = (x: Friend[]) => {
    localStorage.setItem('friends', JSON.stringify(x));
    setFriends(x);
  };

  const players = [...friends.filter(f => f.is_in_game).map(f => f.name), me].sort();

  // sha256 of players to ensure game is same for every one
  const playersHash = hashCode(players.join('#'));

  const seedHash = hashCode(seed);

  const game = gameFromSeed(seedHash, players.length);

  return (
    <>
      <div>
        I am: {me}
      </div>
      <div>
        Friends list:
        <ul>
          {friends.map((friend, i) => (
            <li key={i}>
              {friend.name}
              <button onClick={() => setFriendsPermanent(friends.map((f, j) => i === j ? { ...f, is_in_game: !f.is_in_game } : f))}>
                {friend.is_in_game ? "Leave" : "Join"}
              </button>
              <button onClick={() => setFriendsPermanent(friends.filter((_, j) => i !== j))}>
                Remove
              </button>
            </li>
          ))}
          <button onClick={() => setFriendsPermanent([...friends, { name: window.prompt('Name?') ?? "gav", is_in_game: false }])}>
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
      </div>
      {game && renderGameFor(players.findIndex((x) => x === me), players, game)}
      <PWABadge />
    </>
  )
}

export default App
