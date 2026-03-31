import path from 'path';

let localDb = null;

export async function openDB() {
  const isCloud = !!process.env.POSTGRES_URL || process.env.NODE_ENV === 'production';

  // ==== LOGIQUE CLOUD (Vercel) ====
  if (isCloud) {
    if (!process.env.POSTGRES_URL) {
      console.error("⚠️ ERREUR : La base de données Postgres n'est pas configurée dans Vercel.");
      throw new Error("Base de données Postgres manquante. Vérifiez l'onglet Storage.");
    }
    const { createPool } = require('@vercel/postgres');
    const pool = createPool();

    // ... (le reste de la logique Postgres reste identique)
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
        admin_notes TEXT DEFAULT '',
        client_notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Migrations Postgres pour les notes (au cas où la table existe déjà sans ces colonnes)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='admin_notes') THEN
          ALTER TABLE leads ADD COLUMN admin_notes TEXT DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='client_notes') THEN
          ALTER TABLE leads ADD COLUMN client_notes TEXT DEFAULT '';
        END IF;
      END $$;
    `);

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

  // ==== LOGIQUE LOCALE (SQLite) ====
  // On importe dynamiquement pour ne pas faire planter Vercel
  const sqlite3 = require('sqlite3');
  const { open } = require('sqlite');

  if (!localDb) {
    localDb = await open({
      filename: path.join(process.cwd(), 'leads.db'),
      driver: sqlite3.Database
    });
    
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
        admin_notes TEXT DEFAULT '',
        client_notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try { await localDb.exec("ALTER TABLE leads ADD COLUMN token TEXT"); } catch (e) {}
    try { await localDb.exec("ALTER TABLE leads ADD COLUMN history TEXT DEFAULT '{}'"); } catch (e) {}
    try { await localDb.exec("ALTER TABLE leads ADD COLUMN admin_notes TEXT DEFAULT ''"); } catch (e) {}
    try { await localDb.exec("ALTER TABLE leads ADD COLUMN client_notes TEXT DEFAULT ''"); } catch (e) {}
  }
  return localDb;
}
