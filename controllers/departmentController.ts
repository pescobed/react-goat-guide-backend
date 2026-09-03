import type { Request, Response } from 'express';
import { db } from '../server.ts';

// --- PUBLIC READS ---

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const [results] = await db.query(
      `SELECT d.id, d.name, COUNT(r.id) as resource_count
       FROM departments d
       LEFT JOIN resources r ON r.department_id = d.id
       GROUP BY d.id, d.name
       ORDER BY d.name`
    );
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [deptRows]: any = await db.query('SELECT id, name FROM departments WHERE id = ?', [id]);
    
    if (!deptRows.length) return res.status(404).json({ error: 'Department not found' });
    const dept = deptRows[0];

    const [resources]: any = await db.query(
      `SELECT id, resource_name, description, location, keywords,
              phone, email, socials, hours, cta_link
       FROM resources WHERE department_id = ? ORDER BY resource_name`,
      [id]
    );

    return res.json({ id: dept.id, name: dept.name, resources });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// --- ADMIN WRITES ---

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const [result]: any = await db.query('INSERT INTO departments (name) VALUES (?)', [name]);
    return res.json({ success: true, id: result.insertId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [result]: any = await db.query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Department deleted' });
  } catch (err: any) {
    return res.status(500).json({ 
      error: 'Cannot delete department: Ensure no resources are currently assigned to it.' 
    });
  }
};