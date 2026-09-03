import type { Request, Response } from 'express';
import { db } from '../server.ts';

export const createSuggestion = async (req: Request, res: Response) => {
  try {
    const { 
      resource_name, description, department_id, department_name, 
      location, phone, email, keywords, hours, cta_link, 
      user_name, user_connection, admin_comments 
    } = req.body;

    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;

    const sql = `
      INSERT INTO suggestions (
        resource_name, description, department_id, department_name,
        location, phone, email, keywords, hours, cta_link, 
        user_name, user_connection, admin_comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      resource_name || null, description || null, department_id || null, department_name || null,
      location || null, cleanPhone, email || null, keywords || null, hours || null, cta_link || null, 
      user_name || null, user_connection || null, admin_comments || null
    ];

    await db.query(sql, params);
    return res.status(200).json({ message: "Suggestion submitted successfully! Thank you for your feedback." });
  } catch (err: any) {
    console.error("Database error during suggestion submission:", err);
    return res.status(500).json({ error: "Database error occurred while saving your suggestion." });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const sql = `SELECT * FROM suggestions WHERE status = 'pending' ORDER BY created_at DESC`;
    const [results]: any = await db.query(sql);
    return res.json(results);
  } catch (err: any) {
    console.error("Error fetching suggestions:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateSuggestionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sql = "UPDATE suggestions SET status = ? WHERE id = ?";
    await db.query(sql, [status, id]);
    return res.json({ message: "Suggestion status updated successfully." });
  } catch (err: any) {
    console.error("Error updating suggestion status:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSuggestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result]: any = await db.query("DELETE FROM suggestions WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Suggestion not found." });
    }

    return res.status(200).json({ message: "Suggestion discarded successfully." });
  } catch (err: any) {
    console.error("Error deleting suggestion:", err);
    return res.status(500).json({ error: "Failed to delete suggestion from database." });
  }
};