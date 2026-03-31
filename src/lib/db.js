import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let localDb = null;

export async function openDB() {
  const isCloud = !!process.env.POSTGRES_URL;

  // ==== LOGIQUE CLOUD ====
  if (isCloud) {
    const { createPool } = require('@vercel/postgres');
    const pool = createPool();

    // Création des tables Postgres à l'initialisation si elles n'existent pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        type VARCHAR(255) NOT NULL,
        message TEXT,
        status VARCHAR(255) DEFAULT 'Création du projet',
        token VARCHAR(255) UNIQUE,
        history TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Abstraction pour s'aligner sur la syntaxe locale SQLite
    return {
      run: async (query, params = []) => {
        let pgQuery = query;
        params.forEach((_, i) => { pgQuery = pgQuery.replace('?', `$${i + 1}`); });
        if (pgQuery.trim().toUpperCase().startsWith('INSERT')) {
            pgQuery += ' RETURNING id';
        }
        const res = await pool.query(pgQuery, params);
        return { lastID: res.rows[0]?.id };
      },
      all: async (query, params = []) => {
        let pgQuery = query;
        params.forEach((_, i) => { pgQuery = pgQuery.replace('?', `$${i + 1}`); });
        const res = await pool.query(pgQuery, params);
        return res.rows;
      },
      get: async (query, params = []) => {
        let pgQuery = query;
        params.forEach((_, i) => { pgQuery = pgQuery.replace('?', `$${i + 1}`); });
        const res = await pool.query(pgQuery, params);
        return res.rows[0];
      }
    };
  }

  // ==== LOGIQUE LOCALE SUR MACHINE (SQLite) ====
  if (!localDb) {
    localDb = await open({
      filename: path.join(process.cwd(), 'leads.db'),
      driver: sqlite3.Database
    });
    // Create leads table if it doesn't exist
    await localDb.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        type TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'Création du projet',
        token TEXT UNIQUE,
        history TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations silencieuses
    try { await localDb.exec("ALTER TABLE leads ADD COLUMN token TEXT"); } catch (e) {}
    try { await localDb.exec("ALTER TABLE leads ADD COLUMN history TEXT DEFAULT '{}'"); } catch (e) {}
    
    await localDb.exec(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return localDb;
}
