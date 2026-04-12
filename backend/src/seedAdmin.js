const crypto = require('crypto');
const pool = require('./config/db');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const check = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', ['admin']);
    const count = parseInt(check.rows[0].count);

    if (count > 0) {
      console.log('✅ L\'utilisateur admin existe déjà');
      process.exit(0);
    }

    // Create default admin user
    const username = 'admin';
    const password = 'admin';
    const hashedPassword = hashPassword(password);

    await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)',
      [username, hashedPassword, 'admin@restaurant.local', 'admin']
    );

    console.log('✅ Utilisateur admin créé avec succès');
    console.log('📝 Identifiants de connexion:');
    console.log('   Nom d\'utilisateur: admin');
    console.log('   Mot de passe: admin');
    console.log('⚠️  Changez ces identifiants pour la production!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', err.message);
    process.exit(1);
  }
};

seedAdminUser();
