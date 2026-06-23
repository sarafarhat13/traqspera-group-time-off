import { useEffect, useState } from 'react'

export default function useMediaQuery(query) {
  const getMatch = () =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches

  const [matches, setMatches] = useState(getMatch)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
