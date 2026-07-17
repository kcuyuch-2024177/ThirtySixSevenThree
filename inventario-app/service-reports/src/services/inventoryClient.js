const axios = require('axios');

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002';

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
  timeout: 10000,
});

/**
 * Obtiene todos los productos activos desde service-inventory.
 * Reenvía el header Authorization para que inventory valide el JWT.
 */
async function getProducts(authHeader) {
  const { data } = await inventoryClient.get('/products', {
    headers: {
      Authorization: authHeader,
    },
  });

  return data.data || [];
}

module.exports = { inventoryClient, getProducts };
