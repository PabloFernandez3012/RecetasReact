import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl } from '../lib/api'

function authHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useRecipeComments(recipeId, enabled = true) {
  return useQuery({
    queryKey: ['recipes', recipeId, 'comments'],
    enabled: Boolean(recipeId) && enabled,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/recipes/${recipeId}/comments`), {
        headers: { ...authHeaders() }
      })
      if (!res.ok) throw new Error('Error al cargar comentarios')
      return res.json()
    }
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipeId, text }) => {
      const res = await fetch(apiUrl(`/api/recipes/${recipeId}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear comentario')
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId, 'comments'] })
    }
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, recipeId, text }) => {
      const res = await fetch(apiUrl(`/api/comments/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Error al actualizar comentario')
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId, 'comments'] })
    }
  })
}

export function useReactToComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, recipeId, value }) => {
      const res = await fetch(apiUrl(`/api/comments/${id}/react`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ value })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Error al reaccionar')
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId, 'comments'] })
    }
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, recipeId }) => {
      const res = await fetch(apiUrl(`/api/comments/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders() }
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al eliminar comentario')
      }
      return true
    },
    onSuccess: (_ok, variables) => {
      if (variables?.recipeId) {
        queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId, 'comments'] })
      }
    }
  })
}
