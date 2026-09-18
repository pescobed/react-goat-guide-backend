import type { Request, Response } from 'express';
import { db } from '../server.ts';

// GET /api/buildings - Top-level building cards with location counts
export const getAllBuildings = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        b.id,
        b.building_name,
        COUNT(l.id) AS location_count
      FROM buildings b
      LEFT JOIN locations l ON b.id = l.building_id
      GROUP BY b.id, b.building_name
      ORDER BY b.building_name ASC
    `);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/buildings/:id/locations - Sub-locations/rooms for a specific building
export const getLocationsByBuilding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.query(
      `
      SELECT 
        l.id AS location_id,
        l.name AS location_name,
        l.room_number,
        b.building_name
      FROM locations l
      JOIN buildings b ON l.building_id = b.id
      WHERE b.id = ?
      ORDER BY l.room_number ASC
      `,
      [id]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/buildings - Create new building
export const createBuilding = async (req: Request, res: Response) => {
  try {
    const { building_name } = req.body;
    if (!building_name) {
      return res.status(400).json({ error: 'Building name is required' });
    }
    const [result]: any = await db.query(
      'INSERT INTO buildings (building_name) VALUES (?)',
      [building_name]
    );
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/buildings/:id - Update building
export const updateBuilding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { building_name } = req.body;
    const [result]: any = await db.query(
      'UPDATE buildings SET building_name = ? WHERE id = ?',
      [building_name, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/buildings/:id - Delete building
export const deleteBuilding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result]: any = await db.query('DELETE FROM buildings WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }
    return res.json({ success: true, message: 'Building deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Cannot delete building: Ensure no locations are linked to it.',
    });
  }
};