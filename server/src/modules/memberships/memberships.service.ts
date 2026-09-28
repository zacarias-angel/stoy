import type { RowDataPacket } from 'mysql2';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';

interface MembershipRow extends RowDataPacket {
  status: 'inactive' | 'active' | 'past_due' | 'cancelled' | 'expired';
  expires_at: Date | string | null;
}

export interface MembershipDto {
  isActive: boolean;
  status: 'inactive' | 'active' | 'past_due' | 'cancelled' | 'expired';
  expiresAt: string | null;
  priceArs: number;
  discoveryRadiusMeters: number;
}

export async function getMembership(userId: number): Promise<MembershipDto> {
  const [rows] = await pool.query<MembershipRow[]>(
    `SELECT status, expires_at
     FROM memberships
     WHERE user_id = ?
     ORDER BY COALESCE(expires_at, '9999-12-31') DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  const membership = rows[0];
  const expiresAt = membership?.expires_at ? new Date(membership.expires_at) : null;
  const isActive = membership?.status === 'active' && (!expiresAt || expiresAt.getTime() > Date.now());
  const status = membership && !isActive && membership.status === 'active' && expiresAt
    ? 'expired'
    : membership?.status ?? 'inactive';

  return {
    isActive,
    status,
    expiresAt: expiresAt?.toISOString() ?? null,
    priceArs: env.MEMBERSHIP_PRICE_ARS,
    discoveryRadiusMeters: isActive ? env.NEARBY_RADIUS_MEMBER_METERS : env.NEARBY_RADIUS_FREE_METERS,
  };
}
