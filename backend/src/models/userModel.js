const pool = require('../config/db');

class User {
  // Get user by username
  static async getUserByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${err.message}`);
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const result = await pool.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${err.message}`);
    }
  }

  // Create new user
  static async createUser(username, hashedPassword, email, role = 'admin') {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
        [username, hashedPassword, email, role]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('Cet utilisateur existe déjà');
      }
      throw new Error(`Erreur lors de la création de l'utilisateur: ${err.message}`);
    }
  }

  // Update user password
  static async updatePassword(id, hashedPassword) {
    try {
      const result = await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, role',
        [hashedPassword, id]
      );
      return result.rows[0];
    } catch (err) {
      throw new Error(`Erreur lors de la mise à jour du mot de passe: ${err.message}`);
    }
  }

  // Get all users (for admin)
  static async getAllUsers() {
    try {
      const result = await pool.query(
        'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (err) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${err.message}`);
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${err.message}`);
    }
  }
}

module.exports = User;
