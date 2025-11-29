import { useMutation } from '@tanstack/react-query'
import { apiUrl } from '../lib/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

export function useCreateSuggestion() {
  return useMutation({
    mutationFn: async ({ text }) => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl('/api/suggestions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error enviando sugerencia')
      return data
    }
  })
}
