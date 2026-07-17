const axios = require('axios');

const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002';

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
});

function authHeaders(authorizationHeader) {
  return { Authorization: authorizationHeader };
}

// GET /products de service-inventory, reenviando el JWT del usuario.
async function getProducts(authorizationHeader) {
  const response = await inventoryClient.get('/products', {
    headers: authHeaders(authorizationHeader),
  });

  return response.data?.data || [];
}

// GET /movements de service-inventory (salidas crudas).
async function getMovements(authorizationHeader) {
  const response = await inventoryClient.get('/movements', {
    headers: authHeaders(authorizationHeader),
  });

  return response.data?.data || [];
}

module.exports = { inventoryClient, getProducts, getMovements };
