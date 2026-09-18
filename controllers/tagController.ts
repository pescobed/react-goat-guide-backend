import { Request, Response } from 'express';
import pool from '../config/db';

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, COUNT(rt.resource_id) AS resource_count
      FROM tags t
      LEFT JOIN resource_tags rt ON t.id = rt.tag_id
      GROUP BY t.id
      ORDER BY t.name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tags', error });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    res.status(400).json({ success: false, message: 'Name and slug are required' });
    return;
  }
  try {
    const [result]: any = await pool.query(
      'INSERT INTO tags (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    res.status(201).json({ success: true, id: result.insertId, name, slug });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, slug } = req.body;
  try {
    await pool.query('UPDATE tags SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
    res.json({ success: true, message: 'Tag updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};