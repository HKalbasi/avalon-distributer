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
  return Math.abs(hash).toString(16);
}

function App() {
  const me = "hamid";

  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('friends') ?? "[]") as Array<Friend>)

  const setFriendsPermanent = (x: Friend[]) => {
    localStorage.setItem('friends', JSON.stringify(x));
    setFriends(x);
  };

  const players = [...friends.filter(f => f.is_in_game).map(f => f.name), me].sort();

  // sha256 of players to ensure game is same for every one
  const playersHash = hashCode(players.join('#'));

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
        <br/>
        Number of players: {players.length}
        <br/>
        Players: {players.join(', ')}
        <br/>
        Hash of players: {playersHash}
      </div>
      <PWABadge />
    </>
  )
}

export default App
