import { useMutation, useQuery } from '@tanstack/react-query'
import { apiUrl } from '../lib/api'

function saveToken(token) {
  localStorage.setItem('auth_token', token)
}

function getToken() {
  return localStorage.getItem('auth_token')
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en login')
      saveToken(data.token)
      return data
    }
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetch(apiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en registro')
      saveToken(data.token)
      return data
    }
  })
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    enabled,
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error('No autenticado')
      const res = await fetch(apiUrl('/api/me'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error cargando perfil')
      return data
    }
  })
}

export function logout() {
  localStorage.removeItem('auth_token')
}
