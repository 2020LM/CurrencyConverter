import { useEffect } from 'react'

export const useDebounce = (amount: string, from: string, to: string) => {
  useEffect(() => {
    console.log('Debounce iniciado:', { amount, from, to })

    const timeout = setTimeout(() => {
      console.log('Debounce completado:', { amount, from, to })
    }, 500)

    return () => clearTimeout(timeout)
  }, [amount, from, to])
}