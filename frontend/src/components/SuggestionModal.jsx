import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useCreateSuggestion } from '../hooks/useSuggestions'

export default function SuggestionModal({ open, onClose }) {
  const [text, setText] = useState('')
  const mutation = useCreateSuggestion()

  if (!open) return null

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await mutation.mutateAsync({ text: text.trim() })
      setText('')
      onClose?.()
      alert('¡Gracias! Enviaremos esta receta pronto.')
    } catch (err) {
      alert(err.message)
    }
  }

  return createPortal(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{background:'#111',border:'1px solid #333',borderRadius:10,padding:16,width:'min(92vw,520px)'}}>
        <h3 style={{marginTop:0}}>Sugerir una receta</h3>
        <form onSubmit={onSubmit}>
          <textarea
            value={text}
            onChange={(e)=>setText(e.target.value)}
            rows={4}
            placeholder="Ej: Empanadas de carne al horno"
            style={{width:'100%',resize:'vertical',background:'#0b0b0b',color:'#eee',border:'1px solid #333',borderRadius:8,padding:10}}
          />
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:10}}>
            <button type="button" className="btn" onClick={onClose} style={{background:'#444'}}>Cancelar</button>
            <button type="submit" className="btn" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
