import { db } from '../server.ts';

// GET /api/locations — all unique locations
export const getAllLocations = (req: any, res: any) => {
  db.query(
    `SELECT DISTINCT location FROM resources 
     WHERE location IS NOT NULL AND location != ''
     ORDER BY location`,
    (err: any, results: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results.map((r: any) => r.location));
    }
  );
};

// GET /api/locations/:locationName — resources at that location
export const getResourcesByLocation = (req: any, res: any) => {
  const { locationName } = req.params;
  db.query(
    `SELECT id, resource_name, description, location,
            phone, email, hours, cta_link, keywords
     FROM resources
     WHERE location = ?
     ORDER BY resource_name`,
    [decodeURIComponent(locationName)],
    (err: any, results: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};
