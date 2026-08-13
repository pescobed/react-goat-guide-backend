import { db } from '../server.ts';

// 1. PUBLIC: Get filtered resources for the main site
export const getAllResources = (req: any, res: any) => {
  db.query(
    `SELECT id, resource_name, description, location, keywords,
            phone, email, socials, hours, cta_link, department_id, view_count
     FROM resources 
     WHERE resource_name IS NOT NULL AND resource_name != ''
     AND description IS NOT NULL AND description != ''
     ORDER BY view_count DESC, resource_name ASC`,
    (err: any, results: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// 2. ADMIN STATS: Powers the dashboard top bar
export const getAdminStats = (req: any, res: any) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM resources) as totalResources,
      (SELECT IFNULL(SUM(view_count), 0) FROM resources) as totalViews,
      (SELECT COUNT(*) FROM suggestions) as totalSuggestions
  `;
  db.query(sql, (err: any, results: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// 3. ADMIN LIST: Aliased to match your authRoutes crash
export const getAdminAll = (req: any, res: any) => {
  db.query(
    `SELECT id, resource_name, description, location, keywords, department_id, view_count 
     FROM resources 
     ORDER BY id DESC`,
    (err: any, results: any) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// ALIAS for getAdminAll to prevent "ReferenceError: getAdminResourcesView is not defined"
export const getAdminResourcesView = getAdminAll;

// 4. READ: Single Resource
export const getResourceById = (req: any, res: any) => {
  const { id } = req.params;
  db.query(
    `SELECT * FROM resources WHERE id = ?`,
    [id],
    (err: any, rows: any[]) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(404).json({ error: 'Resource not found' });
      res.json(rows[0]);
    }
  );
};

// 5. CREATE: Add New Resource
export const createResource = (req: any, res: any) => {
  const { resource_name, description, location, keywords, phone, email, socials, hours, cta_link, department_id } = req.body;

  const sql = `INSERT INTO resources (resource_name, description, location, keywords, phone, email, socials, hours, cta_link, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [resource_name, description, location, keywords, phone, email, socials, hours, cta_link, department_id || null];

  db.query(sql, params, (err: any, result: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
};

// 6. UPDATE: Edit Resource
export const updateResource = (req: any, res: any) => {
  const { id } = req.params;
  const { resource_name, description, location, keywords, phone, email, socials, hours, cta_link, department_id } = req.body;

  const sql = `
    UPDATE resources 
    SET resource_name = ?, description = ?, location = ?, keywords = ?, phone = ?, email = ?, socials = ?, hours = ?, cta_link = ?, department_id = ?
    WHERE id = ?
  `;
  const params = [resource_name, description, location, keywords, phone, email, socials, hours, cta_link, department_id || null, id];

  db.query(sql, params, (err: any, result: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// 7. DELETE: Remove Resource
export const deleteResource = (req: any, res: any) => {
  const { id } = req.params;

  db.query(`DELETE FROM resources WHERE id = ?`, [id], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// 8. PUBLIC: Utility
export const incrementViewCount = (req: any, res: any) => {
  const { id } = req.params;
  db.query(`UPDATE resources SET view_count = view_count + 1 WHERE id = ?`, [id], (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

