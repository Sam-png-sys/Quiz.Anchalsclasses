// Format seconds to MM:SS
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// Get badge color classes for difficulty
export const difficultyClass = (diff) => {
  const map = {
    Easy:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Hard:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[diff] || map.Medium
}

// Get badge color for tag (BDS / MDS)
export const tagClass = (tag) => {
  const map = {
    BDS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    MDS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    ALL: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }
  return map[tag] || map.ALL
}

// Truncate text
export const truncate = (str, n = 60) =>
  str.length > n ? str.slice(0, n) + '...' : str

// Calculate score percentage
export const calcScore = (correct, total) =>
  total > 0 ? Math.round((correct / total) * 100) : 0
