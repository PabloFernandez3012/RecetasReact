import { useQuery, useMutation } from '@tanstack/react-query'
import { apiUrl } from '../lib/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

export function useAdminSuggestions(enabled = true) {
  return useQuery({
    queryKey: ['admin','suggestions'],
    enabled,
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl('/api/suggestions'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error cargando sugerencias')
      return data
    }
  })
}

export function useDeleteSuggestion() {
  return useMutation({
    mutationFn: async (id) => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl(`/api/suggestions/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error eliminando sugerencia')
      }
      return true
    }
  })
}
