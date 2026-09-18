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

// POST /api/locations - Create new room location
export const createLocation = async (req: Request, res: Response) => {
  try {
    const { name, building_id, room_number } = req.body;
    if (!name || !building_id) {
      return res.status(400).json({ error: 'Name and building_id are required' });
    }
    const [result]: any = await db.query(
      'INSERT INTO locations (name, building_id, room_number) VALUES (?, ?, ?)',
      [name, building_id, room_number || null]
    );
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/locations/:id - Update location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, building_id, room_number } = req.body;
    const [result]: any = await db.query(
      'UPDATE locations SET name = ?, building_id = ?, room_number = ? WHERE id = ?',
      [name, building_id || null, room_number || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/locations/:id - Delete location
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result]: any = await db.query('DELETE FROM locations WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    return res.json({ success: true, message: 'Location deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Cannot delete location: Ensure no resources are currently assigned to it.',
    });
  }
};