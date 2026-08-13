import { db } from '../server.ts';

/**
 * POST /api/suggestions
 * Captures student/user feedback for resource updates
 */
export const createSuggestion = (req: any, res: any) => {
  const { 
    resource_name, 
    description, 
    department_id, 
    department_name, 
    location, 
    phone, 
    email, 
    keywords, 
    hours, 
    cta_link, 
    user_name, 
    user_connection, 
    admin_comments 
  } = req.body;

  // Clean the phone number: Remove all non-numeric characters
  const cleanPhone = phone ? phone.replace(/\D/g, '') : null;

  const sql = `
    INSERT INTO suggestions (
      resource_name, 
      description, 
      department_id, 
      department_name,
      location, 
      phone, 
      email, 
      keywords, 
      hours, 
      cta_link, 
      user_name, 
      user_connection, 
      admin_comments
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    resource_name || null, 
    description || null, 
    department_id || null, 
    department_name || null,
    location || null, 
    cleanPhone, 
    email || null, 
    keywords || null, 
    hours || null, 
    cta_link || null, 
    user_name || null, 
    user_connection || null, 
    admin_comments || null
  ];

  db.query(sql, params, (err: any, result: any) => {
    if (err) {
      console.error("Database error during suggestion submission:", err);
      return res.status(500).json({ 
        error: "Database error occurred while saving your suggestion." 
      });
    }
    res.status(200).json({ 
      message: "Suggestion submitted successfully! Thank you for your feedback." 
    });
  });
};

/**
 * GET /api/suggestions
 * Fetches all pending suggestions for the Admin Dashboard
 */
export const getSuggestions = (req: any, res: any) => {
  const sql = `
    SELECT * FROM suggestions 
    WHERE status = 'pending' 
    ORDER BY created_at DESC
  `;

  db.query(sql, (err: any, results: any) => {
    if (err) {
      console.error("Error fetching suggestions:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

/**
 * PUT /api/suggestions/:id
 * Allows admin to mark a suggestion as 'reviewed' or 'applied'
 */
export const updateSuggestionStatus = (req: any, res: any) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'applied' or 'rejected'

  const sql = "UPDATE suggestions SET status = ? WHERE id = ?";

  db.query(sql, [status, id], (err: any, result: any) => {
    if (err) {
      console.error("Error updating suggestion status:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Suggestion status updated successfully." });
  });
};

/**
 * DELETE /api/suggestions/:id
 * Permanently removes a suggestion (Discarding it)
 */
export const deleteSuggestion = (req: any, res: any) => {
  const { id } = req.params;

  const sql = "DELETE FROM suggestions WHERE id = ?";

  db.query(sql, [id], (err: any, result: any) => {
    if (err) {
      console.error("Error deleting suggestion:", err);
      return res.status(500).json({ error: "Failed to delete suggestion from database." });
    }

    // Check if the ID existed and was deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Suggestion not found." });
    }

    res.status(200).json({ message: "Suggestion discarded successfully." });
  });
};
