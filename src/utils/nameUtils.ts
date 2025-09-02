export const normalizeName = (name: string): string => {
  return name.toLowerCase().trim()
}

export const hasDuplicate = (list: string[]): boolean => {
  const set = new Set(list)
  return set.size !== list.length
}
