import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/http.js';

export interface ProfileSkill {
  id: number;
  name: string;
  slug: string;
  isPrimary: boolean;
}

export interface ProfileDto {
  userId: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  isVisible: boolean;
  skills: ProfileSkill[];
}

export interface PublicProfileDto {
  userId: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  primarySkill: { id: number; name: string; slug: string } | null;
  skills: ProfileSkill[];
}

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  isVisible?: boolean;
  primarySkillId?: number | null;
  skillIds?: number[];
}

interface ProfileRow extends RowDataPacket {
  user_id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  is_visible: number;
}

interface SkillRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  is_primary: number;
}

async function getUserSkills(userId: number): Promise<ProfileSkill[]> {
  const [rows] = await pool.query<SkillRow[]>(
    `SELECT s.id, s.name, s.slug, us.is_primary
     FROM user_skills us
     JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = ?
     ORDER BY us.is_primary DESC, s.name ASC`,
    [userId]
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isPrimary: row.is_primary === 1,
  }));
}

export async function getOwnProfile(userId: number): Promise<ProfileDto> {
  const [rows] = await pool.query<ProfileRow[]>(
    `SELECT u.id AS user_id, u.email, p.name, p.avatar_url, p.headline, p.bio, p.is_visible
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.status <> 'deleted'
     LIMIT 1`,
    [userId]
  );

  const row = rows[0];
  if (!row) {
    throw new AppError(404, 'Perfil no encontrado', 'not_found');
  }

  const skills = await getUserSkills(userId);
  return {
    userId: row.user_id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    headline: row.headline,
    bio: row.bio,
    isVisible: row.is_visible === 1,
    skills,
  };
}

export async function getPublicProfile(userId: number): Promise<PublicProfileDto> {
  const [rows] = await pool.query<ProfileRow[]>(
    `SELECT u.id AS user_id, u.email, p.name, p.avatar_url, p.headline, p.bio, p.is_visible
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.status = 'active' AND p.is_visible = 1
     LIMIT 1`,
    [userId]
  );

  const row = rows[0];
  if (!row) {
    throw new AppError(404, 'Perfil no encontrado', 'not_found');
  }

  const skills = await getUserSkills(userId);
  const primary = skills.find((skill) => skill.isPrimary) ?? skills[0] ?? null;

  return {
    userId: row.user_id,
    name: row.name,
    avatarUrl: row.avatar_url,
    headline: row.headline,
    bio: row.bio,
    primarySkill: primary
      ? { id: primary.id, name: primary.name, slug: primary.slug }
      : null,
    skills,
  };
}

async function setPrimarySkill(
  connection: PoolConnection,
  userId: number,
  skillId: number | null
): Promise<void> {
  await connection.query('DELETE FROM user_skills WHERE user_id = ? AND is_primary = 1', [
    userId,
  ]);

  if (skillId === null) {
    return;
  }

  const [skillRows] = await connection.query<RowDataPacket[]>(
    'SELECT id FROM skills WHERE id = ? LIMIT 1',
    [skillId]
  );
  if (skillRows.length === 0) {
    throw new AppError(400, 'La habilidad indicada no existe', 'invalid_skill');
  }

  await connection.query(
    `INSERT INTO user_skills (user_id, skill_id, is_primary)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE is_primary = 1`,
    [userId, skillId]
  );
}

async function setSkills(
  connection: PoolConnection,
  userId: number,
  skillIds: number[],
  primarySkillId: number | null | undefined
): Promise<void> {
  const uniqueIds = [...new Set(skillIds)];
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT id FROM skills WHERE id IN (${uniqueIds.map(() => '?').join(', ')})`, uniqueIds
  );
  if (rows.length !== uniqueIds.length) {
    throw new AppError(400, 'Una de las habilidades indicadas no existe', 'invalid_skill');
  }
  const primaryId = primarySkillId === undefined ? uniqueIds[0] : primarySkillId;
  if (primaryId !== null && !uniqueIds.includes(primaryId)) {
    throw new AppError(400, 'La habilidad principal debe estar elegida', 'invalid_skill');
  }
  await connection.query('DELETE FROM user_skills WHERE user_id = ?', [userId]);
  await connection.query(
    `INSERT INTO user_skills (user_id, skill_id, is_primary) VALUES ${uniqueIds.map(() => '(?, ?, ?)').join(', ')}`,
    uniqueIds.flatMap((skillId) => [userId, skillId, skillId === primaryId ? 1 : 0])
  );
}

export async function updateOwnProfile(
  userId: number,
  input: UpdateProfileInput
): Promise<ProfileDto> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      fields.push('name = ?');
      values.push(input.name);
    }
    if (input.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(input.avatarUrl);
    }
    if (input.headline !== undefined) {
      fields.push('headline = ?');
      values.push(input.headline);
    }
    if (input.bio !== undefined) {
      fields.push('bio = ?');
      values.push(input.bio);
    }
    if (input.isVisible !== undefined) {
      fields.push('is_visible = ?');
      values.push(input.isVisible ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(userId);
      const [result] = await connection.query<ResultSetHeader>(
        `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`,
        values
      );
      if (result.affectedRows === 0) {
        throw new AppError(404, 'Perfil no encontrado', 'not_found');
      }
    }

    if (input.skillIds !== undefined) {
      await setSkills(connection, userId, input.skillIds, input.primarySkillId);
    } else if (input.primarySkillId !== undefined) {
      await setPrimarySkill(connection, userId, input.primarySkillId);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getOwnProfile(userId);
}
