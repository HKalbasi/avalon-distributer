export const roleDescriptions = {
  // Avalon roles
  Merlin: 'Knows all evil players except Mordred',
  Persival: 'Knows Merlin and Morgana but not which is which',
  Mordred: 'Evil player hidden from Merlin',
  Morgana: 'Evil player who appears as Merlin to Persival',
  Assassin: 'Can assassinate Merlin at the end',
  Minion: 'Evil servant',
  Servant: 'Good servant with no special powers',
  // Secret Hitler roles
  'Adolf Hitler': 'Fascist leader - win if elected Chancellor after 3 fascist policies',
  Fascist: 'Supports Hitler',
  Liberal: 'Prevents fascist policies',
}

export const rolesPerPlayerCountAvalon: { [x: number]: string[] | undefined } = {
  5: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Servant'],
  6: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Servant', 'Servant'],
  7: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Servant', 'Servant'],
  8: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Servant', 'Servant', 'Servant'],
  9: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Servant', 'Servant', 'Servant', 'Servant'],
  10: ['Merlin', 'Persival', 'Mordred', 'Morgana', 'Assassin', 'Minion', 'Servant', 'Servant', 'Servant', 'Servant'],
}

export const rolesPerPlayerCountHitler: { [x: number]: string[] | undefined } = {
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

export const bads = ['Mordred', 'Morgana', 'Assassin', 'Minion']
