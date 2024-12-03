import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { DB_CONFIG } from './config.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const pool = new pg.Pool(DB_CONFIG);

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(join(__dirname, '../dist')));

// API Routes
app.post('/api/init', async (req, res) => {
  try {
    await pool.query(`
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
    `);
    res.json({ success: true });
  } catch (error) {
    console.error('Schema initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM laundry_orders ORDER BY delivered ASC, order_date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT MAX(order_number) as max_number FROM laundry_orders'
    );
    const newOrderNumber = (rows[0].max_number || 10000) + 1;
    
    const result = await pool.query(
      `INSERT INTO laundry_orders (
        order_number, villa_name, guest_name, order_date,
        total_garments, shirts, tshirts, jeans, trousers,
        shorts, inner_wear, socks, womens_dresses,
        coat_jacket, cap_hat, other, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        newOrderNumber,
        req.body.villa_name,
        req.body.guest_name,
        new Date(),
        req.body.total_garments,
        req.body.shirts,
        req.body.tshirts,
        req.body.jeans,
        req.body.trousers,
        req.body.shorts,
        req.body.inner_wear,
        req.body.socks,
        req.body.womens_dresses,
        req.body.coat_jacket,
        req.body.cap_hat,
        req.body.other,
        req.body.notes
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE laundry_orders SET delivered = $1, delivery_date = $2 WHERE id = $3 RETURNING *',
      [req.body.delivered, req.body.delivered ? new Date() : null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cleanup', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM laundry_orders 
       WHERE delivered = true 
       AND delivery_date < NOW() - INTERVAL '48 hours'
       RETURNING *`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});