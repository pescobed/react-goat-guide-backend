import type { Request, Response } from 'express';
import { db } from '../server.ts';

// 1. PUBLIC: Get filtered resources for the main site
export const getAllResources = async (req: Request, res: Response) => {
  try {
    const [results]: any = await db.query(
      `SELECT id, resource_name, description, location, location_id, keywords,
              phone, email, socials, hours, cta_link, department_id, view_count
       FROM resources 
       WHERE resource_name IS NOT NULL AND resource_name != ''
       AND description IS NOT NULL AND description != ''
       ORDER BY view_count DESC, resource_name ASC`
    );
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 2. ADMIN STATS: Powers the dashboard top bar
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM resources) as totalResources,
        (SELECT IFNULL(SUM(view_count), 0) FROM resources) as totalViews,
        (SELECT COUNT(*) FROM suggestions) as totalSuggestions
    `;
    const [results]: any = await db.query(sql);
    return res.json(results[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 3. ADMIN LIST: Paginated list for editable dashboard tables
export const getAdminAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [rows]: any = await db.query(
      `SELECT id, resource_name, description, location, location_id, keywords, department_id, view_count 
       FROM resources 
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [totalCount]: any = await db.query(`SELECT COUNT(*) as total FROM resources`);

    return res.json({
      data: rows,
      pagination: {
        total: totalCount[0].total,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].total / limit)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAdminResourcesView = getAdminAll;

// 4. READ: Single Resource
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.query(`SELECT * FROM resources WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Resource not found' });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 5. CREATE: Add New Resource
export const createResource = async (req: Request, res: Response) => {
  try {
    const { 
      resource_name, description, location, location_id, 
      keywords, phone, email, socials, hours, cta_link, department_id 
    } = req.body;

    const sql = `
      INSERT INTO resources 
      (resource_name, description, location, location_id, keywords, phone, email, socials, hours, cta_link, department_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      resource_name, description, location || null, location_id || null, 
      keywords, phone, email, socials, hours, cta_link, department_id || null
    ];

    const [result]: any = await db.query(sql, params);
    return res.status(201).json({ success: true, id: result.insertId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 6. UPDATE: Edit Resource
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      resource_name, description, location, location_id, 
      keywords, phone, email, socials, hours, cta_link, department_id 
    } = req.body;

    const sql = `
      UPDATE resources 
      SET resource_name = ?, description = ?, location = ?, location_id = ?, 
          keywords = ?, phone = ?, email = ?, socials = ?, hours = ?, cta_link = ?, department_id = ?
      WHERE id = ?
    `;
    const params = [
      resource_name, description, location || null, location_id || null, 
      keywords, phone, email, socials, hours, cta_link, department_id || null, id
    ];

    await db.query(sql, params);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 7. DELETE: Remove Resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM resources WHERE id = ?`, [id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 8. PUBLIC: Utility
export const incrementViewCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE resources SET view_count = view_count + 1 WHERE id = ?`, [id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};