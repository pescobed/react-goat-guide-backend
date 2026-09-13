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