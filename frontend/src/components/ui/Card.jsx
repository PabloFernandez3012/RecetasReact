export default function Card({ children, as: As = 'div', className = '', ...rest }) {
  return (
    <As className={`card ${className}`.trim()} {...rest}>
      {children}
    </As>
  )
}
