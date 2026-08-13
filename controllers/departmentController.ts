import { type Request, type Response } from 'express';
import { db } from '../server.ts';

const ADMIN_SECRET = 'SeuADMINGOATupdates!@26';

// --- PUBLIC READS ---

export const getAllDepartments = (req: Request, res: Response) => {
  db.query(
    `SELECT d.id, d.name, COUNT(r.id) as resource_count
     FROM departments d
     LEFT JOIN resources r ON r.department_id = d.id
     GROUP BY d.id, d.name
     ORDER BY d.name`,
    (err, results) => {
      if (err) return res.status(500).json({ error: (err as Error).message });
      res.json(results);
    }
  );
};

export const getDepartmentById = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('SELECT id, name FROM departments WHERE id = ?', [id], (err, rows: any[]) => {
    if (err) return res.status(500).json({ error: (err as Error).message });
    if (!rows.length) return res.status(404).json({ error: 'Department not found' });
    const dept = rows[0];
    db.query(
      `SELECT id, resource_name, description, location, keywords,
              phone, email, socials, hours, cta_link
       FROM resources WHERE department_id = ? ORDER BY resource_name`,
      [id],
      (err2, resources: any[]) => {
        if (err2) return res.status(500).json({ error: (err2 as Error).message });
        res.json({ id: dept.id, name: dept.name, resources });
      }
    );
  });
};

// --- ADMIN WRITES ---

export const createDepartment = (req: Request, res: Response) => {
  const { name } = req.body;
  const adminPassword = req.headers['x-admin-password'];

  if (adminPassword !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  if (!name) return res.status(400).json({ error: 'Department name is required' });

  db.query('INSERT INTO departments (name) VALUES (?)', [name], (err, result: any) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
};

export const updateDepartment = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const adminPassword = req.headers['x-admin-password'];

  if (adminPassword !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  db.query('UPDATE departments SET name = ? WHERE id = ?', [name, id], (err, result: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found' });
    res.json({ success: true });
  });
};

export const deleteDepartment = (req: Request, res: Response) => {
  const { id } = req.params;
  const adminPassword = req.headers['x-admin-password'];

  if (adminPassword !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  db.query('DELETE FROM departments WHERE id = ?', [id], (err, result: any) => {
    if (err) return res.status(500).json({ error: 'Cannot delete department: Ensure no resources are currently assigned to it.' });
    res.json({ success: true, message: 'Department deleted' });
  });
};
