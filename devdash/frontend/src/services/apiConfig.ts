// src/services/apiConfig.ts  
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = VITE_API_BASE_URL || 'http://localhost:8000/api/v1'; // Fallback for local dev

console.log("API_BASE_URL set to:", API_BASE_URL); // For debugging