import { useState, useEffect, useRef } from 'react'

export function useTimer(initialSeconds = 600, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const formatted = () => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const isWarning = seconds < 60

  return { seconds, formatted, isWarning }
}
