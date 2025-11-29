import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl } from '../lib/api'

function authHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ===== QUERIES (Lecturas) =====

/**
 * Hook para obtener todas las recetas
 */
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/api/recipes-summary'))
      if (!response.ok) {
        throw new Error('Error al cargar las recetas')
      }
      return response.json()
    },
  })
}

/**
 * Hook para obtener una receta por ID
 */
export function useRecipe(id) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`/api/recipes/${id}`))
      if (!response.ok) {
        throw new Error('Error al cargar la receta')
      }
      return response.json()
    },
    enabled: !!id, // Solo ejecutar si hay un ID
  })
}

// ===== MUTATIONS (Escrituras) =====

/**
 * Hook para crear una nueva receta
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRecipe) => {
      const response = await fetch(apiUrl('/api/recipes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newRecipe),
      })
      if (!response.ok) {
        throw new Error('Error al crear la receta')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidar la cache para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

/**
 * Hook para actualizar una receta existente
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(apiUrl(`/api/recipes/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar la receta')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidar tanto la lista como el detalle específico
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] })
    },
  })
}

/**
 * Hook para eliminar una receta
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(apiUrl(`/api/recipes/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders() }
      })
      if (!response.ok) {
        throw new Error('Error al eliminar la receta')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidar la cache de la lista
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}
