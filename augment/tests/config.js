const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('../config');

// Configuration pour les tests
config.env = 'test';
config.database.uri = 'mongodb://localhost:27017/devcraft-test';
config.jwt.secret = 'test-secret-key';

// Créer une instance MongoDB en mémoire pour les tests
let mongoServer;

// Connexion à la base de données de test
const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à la base de données de test réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données de test:', error);
    process.exit(1);
  }
};

// Déconnexion de la base de données de test
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('✅ Déconnexion de la base de données de test réussie');
  } catch (error) {
    console.error('❌ Erreur de déconnexion de la base de données de test:', error);
    process.exit(1);
  }
};

// Nettoyer la base de données entre les tests
const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données de test:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB,
  config
};
