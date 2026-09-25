import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/http.js';
import { signAccessToken } from '../../utils/jwt.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { getOwnProfile, type ProfileDto } from '../profiles/profiles.service.js';
import type { LoginInput, RegisterInput } from './auth.validation.js';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string | null;
  status: string;
}

export interface SessionDto {
  token: string;
  user: { id: number; email: string };
}

export async function registerUser(input: RegisterInput): Promise<SessionDto> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [input.email]
    );
    if (existing.length > 0) {
      throw new AppError(409, 'Ese email ya esta registrado', 'email_taken');
    }

    const passwordHash = await hashPassword(input.password);
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [input.email, passwordHash]
    );
    const userId = result.insertId;

    await connection.query(
      'INSERT INTO profiles (user_id, name, headline) VALUES (?, ?, ?)',
      [userId, input.name, input.headline ?? null]
    );

    await connection.commit();

    return {
      token: signAccessToken(userId),
      user: { id: userId, email: input.email },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function loginUser(input: LoginInput): Promise<SessionDto> {
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, email, password_hash, status FROM users WHERE email = ? LIMIT 1',
    [input.email]
  );

  const user = rows[0];
  if (!user || !user.password_hash) {
    throw new AppError(401, 'Email o contrasena incorrectos', 'invalid_credentials');
  }
  if (user.status !== 'active') {
    throw new AppError(403, 'La cuenta no esta activa', 'account_inactive');
  }

  const valid = await verifyPassword(input.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'Email o contrasena incorrectos', 'invalid_credentials');
  }

  return {
    token: signAccessToken(user.id),
    user: { id: user.id, email: user.email },
  };
}

export async function getMe(userId: number): Promise<ProfileDto> {
  return getOwnProfile(userId);
}
