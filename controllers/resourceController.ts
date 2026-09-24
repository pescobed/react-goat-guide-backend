import { Request, Response } from 'express';
import db from '../config/db';

/**
 * Helper: Syncs tags for a given resource within a database transaction.
 */
async function syncResourceTags(connection: any, resourceId: number, tags: string[] | undefined) {
  // Clear old tag mappings for this resource
  await connection.query('DELETE FROM resource_tags WHERE resource_id = ?', [resourceId]);

  if (!tags || !Array.isArray(tags) || tags.length === 0) return;

  for (const rawTag of tags) {
    const tagName = rawTag.trim().toLowerCase();
    if (!tagName) continue;

    // 1. Insert tag into master tags table if it doesn't already exist
    await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName]);

    // 2. Retrieve tag ID
    const [[tagRow]]: any = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);

    // 3. Insert junction mapping
    if (tagRow) {
      await connection.query(
        'INSERT IGNORE INTO resource_tags (resource_id, tag_id) VALUES (?, ?)',
        [resourceId, tagRow.id]
      );
    }
  }
}

/**
 * GET /api/resources
 * Fetches all resources with joined department names and comma-aggregated tags.
 */
export const getAllResources = async (req: Request, res: Response) => {
  try {
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
        d.id AS department_id,
        d.name AS department_name,
        GROUP_CONCAT(DISTINCT t.name ORDER BY t.name ASC SEPARATOR ',') AS tags
      FROM resources r
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      GROUP BY r.id
      ORDER BY r.resource_name ASC
    `;

    const [rows]: any = await db.query(query);

    const resources = rows.map((row: any) => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));

    res.json({ success: true, data: resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
};

/**
 * GET /api/resources/:id
 * Fetches a single resource by ID with joined department and tag details.
 */
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
        d.id AS department_id,
        d.name AS department_name,
        GROUP_CONCAT(DISTINCT t.name ORDER BY t.name ASC SEPARATOR ',') AS tags
      FROM resources r
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      WHERE r.id = ?
      GROUP BY r.id
    `;

    const [rows]: any = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const resource = {
      ...rows[0],
      tags: rows[0].tags ? rows[0].tags.split(',') : []
    };

    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resource' });
  }
};

/**
 * POST /api/resources
 * Creates a new resource and links its tags.
 */
export const createResource = async (req: Request, res: Response) => {
  const {
    resource_name,
    description,
    location,
    phone,
    email,
    socials,
    hours,
    cta_link,
    department_id,
    tags
  } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const insertQuery = `
      INSERT INTO resources 
        (resource_name, description, location, phone, email, socials, hours, cta_link, department_id, view_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const [result]: any = await connection.query(insertQuery, [
      resource_name,
      description,
      location,
      phone,
      email,
      socials,
      hours,
      cta_link,
      department_id || null
    ]);

    const newResourceId = result.insertId;

    // Sync tags for newly created resource
    await syncResourceTags(connection, newResourceId, tags);

    await connection.commit();
    res.status(201).json({ success: true, message: 'Resource created successfully', id: newResourceId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating resource:', error);
    res.status(500).json({ success: false, message: 'Failed to create resource' });
  } finally {
    connection.release();
  }
};

/**
 * PUT /api/resources/:id
 * Updates an existing resource and updates tag associations.
 */
export const updateResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    resource_name,
    description,
    location,
    phone,
    email,
    socials,
    hours,
    cta_link,
    department_id,
    tags
  } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const updateQuery = `
      UPDATE resources 
      SET 
        resource_name = ?, 
        description = ?, 
        location = ?, 
        phone = ?, 
        email = ?, 
        socials = ?, 
        hours = ?, 
        cta_link = ?, 
        department_id = ?
      WHERE id = ?
    `;

    await connection.query(updateQuery, [
      resource_name,
      description,
      location,
      phone,
      email,
      socials,
      hours,
      cta_link,
      department_id || null,
      id
    ]);

    // Sync tag associations
    await syncResourceTags(connection, id, tags);

    await connection.commit();
    res.json({ success: true, message: 'Resource updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating resource:', error);
    res.status(500).json({ success: false, message: 'Failed to update resource' });
  } finally {
    connection.release();
  }
};

/**
 * DELETE /api/resources/:id
 * Deletes a resource (foreign keys handle clearing resource_tags via ON DELETE CASCADE).
 */
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result]: any = await db.query('DELETE FROM resources WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
};

/**
 * PATCH /api/resources/:id/view
 * Increments view count for analytics.
 */
export const incrementViewCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'View count updated' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Failed to increment view count' });
  }
};

/**
 * GET /api/resources/admin/stats
 * Fetches dashboard summary statistics.
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [[{ total_resources }]]: any = await db.query('SELECT COUNT(*) AS total_resources FROM resources');
    const [[{ total_views }]]: any = await db.query('SELECT SUM(view_count) AS total_views FROM resources');
    const [[{ total_departments }]]: any = await db.query('SELECT COUNT(*) AS total_departments FROM departments');
    const [[{ total_tags }]]: any = await db.query('SELECT COUNT(*) AS total_tags FROM tags');

    res.json({
      success: true,
      data: {
        total_resources,
        total_views: total_views || 0,
        total_departments,
        total_tags
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

/**
 * GET /api/resources/admin/all
 * Returns full administrative detail list.
 */
export const getAdminAll = async (req: Request, res: Response) => {
  return getAllResources(req, res);
};