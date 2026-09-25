import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../../db/pool.js';
import { asyncHandler } from '../../utils/http.js';

export const skillsRouter = Router();

skillsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, slug FROM skills ORDER BY name ASC'
    );
    res.json({ skills: rows });
  })
);
