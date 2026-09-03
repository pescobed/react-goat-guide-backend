import type { Request, Response } from 'express';
import { db } from '../server.ts';

// GET /api/locations — all unique locations from new locations table
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(`SELECT id, name FROM locations ORDER BY name ASC`);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/locations/:locationName — resources at that location
export const getResourcesByLocation = async (req: Request, res: Response) => {
  try {
    const { locationName } = req.params;
    const [results]: any = await db.query(
      `SELECT id, resource_name, description, location, location_id,
              phone, email, hours, cta_link, keywords
       FROM resources
       WHERE location = ? OR location_id = ?
       ORDER BY resource_name`,
      [decodeURIComponent(locationName), decodeURIComponent(locationName)]
    );
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
