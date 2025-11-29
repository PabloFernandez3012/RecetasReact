import { useQuery, useMutation } from '@tanstack/react-query'
import { apiUrl } from '../lib/api'
import { queryClient } from '../lib/queryClient'

function getToken() {
  return localStorage.getItem('auth_token')
}

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: ['favorites'],
    enabled,
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl('/api/favorites'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error cargando favoritos')
      return data
    }
  })
}

export function useLikeRecipe() {
  return useMutation({
    mutationFn: async (recipeId) => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl(`/api/recipes/${recipeId}/like`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al marcar favorito')
      }
      return { ok: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    }
  })
}

export function useUnlikeRecipe() {
  return useMutation({
    mutationFn: async (recipeId) => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl(`/api/recipes/${recipeId}/like`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al quitar favorito')
      }
      return { ok: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    }
  })
}
