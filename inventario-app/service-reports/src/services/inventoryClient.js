const axios = require('axios');

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002';

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
});

// TODO: agregar funciones que consuman los endpoints de service-inventory,
// ej: async function getProducts() { return inventoryClient.get('/api/products'); }

module.exports = { inventoryClient };
