import bcrypt from 'bcryptjs';

// The "cost" factor. 10 is the industry standard balance of speed/security.
const SALT_ROUNDS = 10;

/**
 * hashPassword:
 * Takes a plain text password and turns it into a "hash".
 * Uses the saved HASH in the database, and never the real password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * comparePassword:
 * Takes the password the user typed in the login form and 
 * compares it to the hash stored in your MySQL database.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
