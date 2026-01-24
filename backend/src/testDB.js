const pool = require('./config/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW() AS heure');
    console.log('✅ Connexion OK ! Heure actuelle DB :', res.rows[0].heure);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur connexion PostgreSQL :', err.stack); // <-- affiche tout
    process.exit(1);
  }
})();
