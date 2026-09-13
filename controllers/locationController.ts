import type { Request, Response } from 'express';
import { db } from '../server.ts';

// GET /api/locations — all locations linked to their parent building
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        l.id, 
        l.name, 
        l.room_number, 
        b.id AS building_id, 
        b.building_name
      FROM locations l
      LEFT JOIN buildings b ON l.building_id = b.id
      ORDER BY b.building_name ASC, l.room_number ASC
    `);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/locations/:id/resources — resources assigned to a location ID
export const getResourcesByLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [results]: any = await db.query(
      `SELECT id, resource_name, description, location, location_id,
              phone, email, hours, cta_link, keywords
       FROM resources
       WHERE location_id = ?
       ORDER BY resource_name`,
      [id]
    );
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};