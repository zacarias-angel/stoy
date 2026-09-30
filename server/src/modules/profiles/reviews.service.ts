import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/http.js';

export interface ReviewDto {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { userId: number; name: string; avatarUrl: string | null };
}

export interface ReviewsDto {
  reviews: ReviewDto[];
  viewerReview: ReviewDto | null;
}

interface ReviewRow extends RowDataPacket {
  id: number;
  rating: number;
  comment: string | null;
  created_at: Date | string;
  reviewer_user_id: number;
  reviewer_name: string;
  reviewer_avatar_url: string | null;
}

function toReviewDto(row: ReviewRow): ReviewDto {
  return { id: row.id, rating: row.rating, comment: row.comment, createdAt: new Date(row.created_at).toISOString(), reviewer: { userId: row.reviewer_user_id, name: row.reviewer_name, avatarUrl: row.reviewer_avatar_url } };
}

export async function getReviews(reviewedUserId: number, viewerUserId: number): Promise<ReviewsDto> {
  const [rows] = await pool.query<ReviewRow[]>(
    `SELECT r.id, r.rating, r.comment, r.created_at, r.reviewer_user_id, p.name AS reviewer_name, p.avatar_url AS reviewer_avatar_url
     FROM profile_reviews r JOIN profiles p ON p.user_id = r.reviewer_user_id
     WHERE r.reviewed_user_id = ? ORDER BY r.created_at DESC, r.id DESC`,
    [reviewedUserId]
  );
  const reviews = rows.map(toReviewDto);
  return { reviews, viewerReview: reviews.find((review) => review.reviewer.userId === viewerUserId) ?? null };
}

export async function saveReview(reviewerUserId: number, reviewedUserId: number, input: { rating: number; comment?: string | null }): Promise<ReviewDto> {
  if (reviewerUserId === reviewedUserId) throw new AppError(400, 'No podes calificar tu propio perfil', 'self_review');

  const [targets] = await pool.query<RowDataPacket[]>(
    `SELECT p.user_id FROM profiles p JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ? AND p.is_visible = 1 AND u.status = 'active' LIMIT 1`,
    [reviewedUserId]
  );
  if (targets.length === 0) throw new AppError(404, 'Perfil no encontrado', 'not_found');

  await pool.query<ResultSetHeader>(
    `INSERT INTO profile_reviews (reviewer_user_id, reviewed_user_id, rating, comment) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
    [reviewerUserId, reviewedUserId, input.rating, input.comment ?? null]
  );

  const [rows] = await pool.query<ReviewRow[]>(
    `SELECT r.id, r.rating, r.comment, r.created_at, r.reviewer_user_id, p.name AS reviewer_name, p.avatar_url AS reviewer_avatar_url
     FROM profile_reviews r JOIN profiles p ON p.user_id = r.reviewer_user_id
     WHERE r.reviewer_user_id = ? AND r.reviewed_user_id = ? LIMIT 1`,
    [reviewerUserId, reviewedUserId]
  );
  return toReviewDto(rows[0]!);
}
