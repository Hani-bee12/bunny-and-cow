export const PEOPLE = [
  { id: 'piggy', name: 'Bunny', icon: '🐰', color: '#F45B9E' },
  { id: 'cow', name: 'Cow', icon: '🐮', color: '#6C5CE7' },
]

export function getPerson(id) {
  return PEOPLE.find((p) => p.id === id) || null
}
