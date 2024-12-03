// API URL based on environment
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://ptmosaic.com/api'  // Production API URL
  : 'http://localhost:3000/api'; // Development API URL

// Webhook URLs
export const WEBHOOK_NEW_ORDER = 'https://hook.eu1.make.com/mbnwb7lff4xv2u1y1b4lt3mpiizs11hh';
export const WEBHOOK_DELIVERED = 'https://hook.eu1.make.com/1bkuivimuxrrkveycih7kqsu35atdomg';

// Villa options
export const VILLAS = ['Villa A', 'Villa B', 'Villa C', 'Villa D', 'Villa E'];

// Garment types configuration
export const GARMENT_TYPES = [
  { label: 'Shirts', key: 'shirts' },
  { label: 'T-Shirts', key: 'tshirts' },
  { label: 'Jeans', key: 'jeans' },
  { label: 'Trousers', key: 'trousers' },
  { label: 'Shorts', key: 'shorts' },
  { label: 'Inner Wear', key: 'inner_wear' },
  { label: 'Socks', key: 'socks' },
  { label: "Women's Dresses", key: 'womens_dresses' },
  { label: 'Coat/Jacket', key: 'coat_jacket' },
  { label: 'Cap/Hat', key: 'cap_hat' },
  { label: 'Other', key: 'other' },
] as const;