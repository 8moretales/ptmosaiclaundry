import { Pool } from 'pg';
import { DB_CONFIG } from './config';

const pool = new Pool(DB_CONFIG);

export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return { rows: result.rows, error: null };
  } catch (error) {
    console.error('Database error:', error);
    return { rows: [], error };
  }
};

export const initializeSchema = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS laundry_orders (
      id SERIAL PRIMARY KEY,
      order_number BIGINT NOT NULL UNIQUE,
      villa_name TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      delivery_date TIMESTAMP WITH TIME ZONE,
      delivered BOOLEAN NOT NULL DEFAULT FALSE,
      total_garments INTEGER NOT NULL,
      shirts INTEGER NOT NULL DEFAULT 0,
      tshirts INTEGER NOT NULL DEFAULT 0,
      jeans INTEGER NOT NULL DEFAULT 0,
      trousers INTEGER NOT NULL DEFAULT 0,
      shorts INTEGER NOT NULL DEFAULT 0,
      inner_wear INTEGER NOT NULL DEFAULT 0,
      socks INTEGER NOT NULL DEFAULT 0,
      womens_dresses INTEGER NOT NULL DEFAULT 0,
      coat_jacket INTEGER NOT NULL DEFAULT 0,
      cap_hat INTEGER NOT NULL DEFAULT 0,
      other INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_laundry_orders_delivered_date 
      ON laundry_orders(delivered, order_date DESC);
  `;

  const { error } = await query(createTableSQL);
  if (error) {
    console.error('Failed to initialize schema:', error);
    throw error;
  }
};