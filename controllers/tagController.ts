import { Request, Response } from 'express';
import db from '../config/db';

/**
 * GET /api/tags
 * Fetches all master tags with resource counts.
 */
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        t.id, 
        t.name, 
        COUNT(rt.resource_id) AS resource_count 
      FROM tags t
      LEFT JOIN resource_tags rt ON t.id = rt.tag_id
      GROUP BY t.id
      ORDER BY t.name ASC
    `;

    const [tags]: any = await db.query(query);
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tags' });
  }
};

/**
 * GET /api/tags/:name/resources
 * Fetches all resources associated with a given tag name.
 */
export const getResourcesByTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const query = `
      SELECT 
        r.id,
        r.resource_name,
        r.description,
        r.location,
        r.phone,
        r.email,
        r.socials,
        r.hours,
        r.cta_link,
        r.view_count,
        d.name AS department_name
      FROM resources r
      JOIN resource_tags rt ON r.id = rt.resource_id
      JOIN tags t ON rt.tag_id = t.id
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE LOWER(t.name) = LOWER(?)
      ORDER BY r.resource_name ASC
    `;

    const [resources]: any = await db.query(query, [name]);
    res.json({ success: true, data: resources });
  } catch (error) {
    console.error('Error fetching resources for tag:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resources for tag' });
  }
};