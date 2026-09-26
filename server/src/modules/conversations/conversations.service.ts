import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/http.js';

interface ConversationRow extends RowDataPacket {
  id: number; other_user_id: number; name: string; avatar_url: string | null; headline: string | null;
  text_content: string | null; last_message_at: Date | null;
}
interface MessageRow extends RowDataPacket { id: number; sender_user_id: number; text_content: string; created_at: Date; }

export async function assertNotBlocked(userId: number, otherUserId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM blocks WHERE (blocker_user_id = ? AND blocked_user_id = ?) OR (blocker_user_id = ? AND blocked_user_id = ?) LIMIT 1`,
    [userId, otherUserId, otherUserId, userId]
  );
  if (rows.length) throw new AppError(403, 'No podes contactar a esta persona', 'blocked');
}

async function assertMember(conversationId: number, userId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ? LIMIT 1', [conversationId, userId]
  );
  if (!rows.length) throw new AppError(404, 'Conversacion no encontrada', 'not_found');
}

export async function createDirectConversation(userId: number, otherUserId: number): Promise<{ id: number }> {
  if (userId === otherUserId) throw new AppError(400, 'No podes iniciar un chat con vos mismo', 'invalid_recipient');
  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ? AND status = \'active\' LIMIT 1', [otherUserId]);
  if (!users.length) throw new AppError(404, 'Persona no encontrada', 'not_found');
  await assertNotBlocked(userId, otherUserId);
  const [first, second] = [userId, otherUserId].sort((a, b) => a - b);
  const directKey = `${first}:${second}`;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query<ResultSetHeader>('INSERT INTO conversations (direct_key) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)', [directKey]);
    const id = result.insertId;
    await connection.query('INSERT IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)', [id, userId, id, otherUserId]);
    await connection.commit();
    return { id };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function listConversations(userId: number) {
  const [rows] = await pool.query<ConversationRow[]>(
    `SELECT c.id, other.user_id AS other_user_id, p.name, p.avatar_url, p.headline,
        (SELECT m.text_content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS text_content,
        (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_message_at
     FROM conversations c JOIN conversation_members mine ON mine.conversation_id = c.id AND mine.user_id = ?
     JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id <> ?
     JOIN profiles p ON p.user_id = other.user_id
     ORDER BY COALESCE(last_message_at, c.updated_at) DESC`, [userId, userId]
  );
  return rows.map((row) => ({ id: row.id, otherUser: { userId: row.other_user_id, name: row.name, avatarUrl: row.avatar_url, headline: row.headline }, lastMessage: row.text_content ? { text: row.text_content, createdAt: row.last_message_at } : null }));
}

export async function listMessages(userId: number, conversationId: number, limit: number) {
  await assertMember(conversationId, userId);
  const [rows] = await pool.query<MessageRow[]>('SELECT id, sender_user_id, text_content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at DESC, id DESC LIMIT ?', [conversationId, limit]);
  return { messages: rows.reverse().map((row) => ({ id: row.id, senderUserId: row.sender_user_id, text: row.text_content, createdAt: row.created_at })) };
}

export async function sendMessage(userId: number, conversationId: number, text: string) {
  await assertMember(conversationId, userId);
  const [members] = await pool.query<RowDataPacket[]>('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id <> ? LIMIT 1', [conversationId, userId]);
  await assertNotBlocked(userId, Number(members[0].user_id));
  const [result] = await pool.query<ResultSetHeader>('INSERT INTO messages (conversation_id, sender_user_id, text_content) VALUES (?, ?, ?)', [conversationId, userId, text]);
  await pool.query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);
  return {
    recipientUserId: Number(members[0].user_id),
    message: { id: result.insertId, senderUserId: userId, text, createdAt: new Date() },
  };
}

export async function blockUser(userId: number, otherUserId: number): Promise<void> {
  if (userId === otherUserId) throw new AppError(400, 'No podes bloquearte a vos mismo', 'invalid_recipient');
  await pool.query('INSERT IGNORE INTO blocks (blocker_user_id, blocked_user_id) VALUES (?, ?)', [userId, otherUserId]);
}

export async function reportUser(userId: number, otherUserId: number, reason: string, details?: string | null): Promise<void> {
  if (userId === otherUserId) throw new AppError(400, 'No podes reportarte a vos mismo', 'invalid_recipient');
  await pool.query('INSERT INTO reports (reporter_user_id, reported_user_id, reason, details) VALUES (?, ?, ?, ?)', [userId, otherUserId, reason, details ?? null]);
}
