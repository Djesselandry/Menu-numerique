const crypto = require('crypto');
const User = require('../models/userModel');

// Helper function to hash password (basic implementation)
// For production, use bcryptjs instead
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper function to generate a simple JWT-like token
const generateToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Nom d\'utilisateur et mot de passe requis'
      });
    }

    // Find user
    const user = await User.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Generate token
    const tokenData = generateToken(user.id);

    // Return success with user data (without password)
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: tokenData.token,
      expiresAt: tokenData.expiresAt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/register (optional - for creating admin accounts)
const register = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Nom d\'utilisateur et mot de passe requis'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 4 caractères'
      });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const newUser = await User.createUser(username, hashedPassword, email, role);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: newUser
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/auth/verify (verify token - simple implementation)
const verify = async (req, res) => {
  try {
    // In a real app, you would verify the token validity here
    // For now, just check if token exists in header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token manquant'
      });
    }

    // Extract userId from token (in a real app, verify JWT signature)
    // For this simple implementation, we'll trust the token format
    res.json({
      success: true,
      message: 'Token valide'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // In a real app, you would invalidate the token here
    // For now, just return success
    res.json({
      success: true,
      message: 'Déconnecté avec succès'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  login,
  register,
  verify,
  logout
};
