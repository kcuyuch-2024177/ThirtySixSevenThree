const axios = require('axios');

const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002';

const INVENTORY_TIMEOUT_MS = Number(process.env.INVENTORY_TIMEOUT_MS) || 8000;

const inventoryClient = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
  timeout: INVENTORY_TIMEOUT_MS,
});

function authHeaders(authorizationHeader) {
  return { Authorization: authorizationHeader };
}

async function getProducts(authorizationHeader) {
  const response = await inventoryClient.get('/products', {
    headers: authHeaders(authorizationHeader),
  });

  return response.data?.data || [];
}

async function getMovements(authorizationHeader) {
  const response = await inventoryClient.get('/movements', {
    headers: authHeaders(authorizationHeader),
  });

  return response.data?.data || [];
}

module.exports = { inventoryClient, getProducts, getMovements };
