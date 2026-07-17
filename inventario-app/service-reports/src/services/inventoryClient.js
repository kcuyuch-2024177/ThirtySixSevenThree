const axios = require('axios');

const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002';

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
});

// GET /products de service-inventory, reenviando el JWT del usuario.
async function getProducts(authorizationHeader) {
  const response = await inventoryClient.get('/products', {
    headers: {
      Authorization: authorizationHeader,
    },
  });

  // service-inventory responde { success: true, data: [...] }
  return response.data?.data || [];
}

module.exports = { inventoryClient, getProducts };
