import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { createUser, getUserByEmail, getUserById } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const TOKEN_EXPIRES = '7d'

export async function registerUser(email, password) {
  email = String(email || '').trim().toLowerCase()
  if (!email || !password) throw new Error('Email y password requeridos')
  const existing = getUserByEmail(email)
  if (existing) throw new Error('Email ya registrado')
  const passwordHash = await bcrypt.hash(password, 10)
  const user = createUser({ id: nanoid(12), email, passwordHash })
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
  return getUserById(userId)
}
