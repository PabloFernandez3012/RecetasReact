import { useState } from 'react'
import SuggestionModal from './SuggestionModal'
import { useMe } from '../hooks/useAuth'

export default function SuggestionFab() {
  const hasToken = Boolean(localStorage.getItem('auth_token'))
  const { isSuccess } = useMe(hasToken)
  const [open, setOpen] = useState(false)

  if (!hasToken || !isSuccess) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Sugerir receta"
        aria-label="Sugerir receta"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#0ea5e9',
          color: '#fff',
          border: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 999
        }}
      >
        +
      </button>
      <SuggestionModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
