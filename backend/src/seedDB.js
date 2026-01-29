const pool = require('./config/db');

const seedData = async () => {
  try {
    // Vérifier si la table a déjà des données
    const check = await pool.query('SELECT COUNT(*) FROM menu');
    const count = parseInt(check.rows[0].count);

    if (count > 0) {
      console.log(`✅ La table menu contient déjà ${count} plats`);
      process.exit(0);
    }

    // Insérer des données de test
    const items = [
      { name: 'Burger Classique', description: 'Burger savoureux avec fromage', price: 12.50, category: 'Burgers' },
      { name: 'Burger Bacon', description: 'Burger avec bacon croustillant', price: 14.00, category: 'Burgers' },
      { name: 'Pizza Margherita', description: 'Pizza classique avec tomates et mozzarella', price: 11.00, category: 'Pizzas' },
      { name: 'Pizza Pepperoni', description: 'Pizza avec pepperoni', price: 13.50, category: 'Pizzas' },
      { name: 'Pâtes Carbonara', description: 'Pâtes à l\'italienne', price: 10.50, category: 'Pâtes' },
      { name: 'Salade César', description: 'Salade fraîche avec sauce César', price: 9.00, category: 'Salades' },
      { name: 'Sushi Mix', description: 'Assortiment de sushi', price: 15.00, category: 'Sushi' },
      { name: 'Tiramisu', description: 'Dessert italien classique', price: 7.50, category: 'Desserts' }
    ];

    for (const item of items) {
      await pool.query(
        'INSERT INTO menu (name, description, price, is_active) VALUES ($1, $2, $3, TRUE)',
        [item.name, item.description, item.price]
      );
    }

    console.log(`✅ ${items.length} plats ajoutés à la base de données`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

seedData();
