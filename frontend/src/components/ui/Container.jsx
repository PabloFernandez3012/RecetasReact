export default function Container({ children, className = '', style }) {
  return (
    <div className={`container ${className}`.trim()} style={style}>
      {children}
    </div>
  )
}
