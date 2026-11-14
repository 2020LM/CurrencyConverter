import { useEffect } from 'react'

export const useDebounce = (amount: string, from: string, to: string) => {
  useEffect(() => {

    const timeout = setTimeout(() => {
    }, 500)

    return () => clearTimeout(timeout)
  }, [amount, from, to])
}