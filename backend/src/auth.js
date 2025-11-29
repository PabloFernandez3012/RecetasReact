import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { createUser, getUserByEmail, getUserById, updateUser } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const TOKEN_EXPIRES = '7d'

export async function registerUser(email, password, name) {
  email = String(email || '').trim().toLowerCase()
  if (!email || !password) throw new Error('Email y password requeridos')
  const existing = getUserByEmail(email)
  if (existing) throw new Error('Email ya registrado')
  const passwordHash = await bcrypt.hash(password, 10)
  const cleanName = name ? String(name).trim() : ''
  // Asignar role admin si email está en ADMIN_EMAILS
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  const role = adminEmails.includes(email) ? 'admin' : 'user'
  const user = createUser({ id: nanoid(12), email, passwordHash, name: cleanName || null, role })
  return issueToken(user.id)
}

export async function loginUser(email, password) {
  email = String(email || '').trim().toLowerCase()
  const user = getUserByEmail(email)
  if (!user) throw new Error('Credenciales inválidas')
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new Error('Credenciales inválidas')
  return issueToken(user.id)
}

function issueToken(userId) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
  return { token }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const [, token] = header.split(' ')
  if (!token) return res.status(401).json({ error: 'No autorizado' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export function requireAuth(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'No autorizado' })
  next()
}

export function getMe(userId) {
  const u = getUserById(userId)
  if (!u) return null
  return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }
}

export async function updateProfile(userId, { name, currentPassword, newPassword }) {
  const user = getUserById(userId)
  if (!user) throw new Error('Usuario no encontrado')
  let passwordHash
  if (newPassword) {
    if (!currentPassword) throw new Error('currentPassword requerido para cambiar contraseña')
    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) throw new Error('Contraseña actual incorrecta')
    if (newPassword.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
    passwordHash = await bcrypt.hash(newPassword, 10)
  }
  const updated = updateUser(userId, {
    ...(name !== undefined ? { name: String(name).trim() || null } : {}),
    ...(passwordHash ? { passwordHash } : {})
  })
  return { id: updated.id, email: updated.email, name: updated.name, role: updated.role, createdAt: updated.createdAt }
}

export function isAdmin(userId) {
  const u = getUserById(userId)
  return u && u.role === 'admin'
}
