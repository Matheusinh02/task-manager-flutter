// SQLite Service Worker for Web
// This file enables SQLite to work in the browser

importScripts('https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.js');

let db;

self.addEventListener('message', async (event) => {
  const { id, method, args } = event.data;
  
  try {
    let result;
    
    if (method === 'init') {
      const SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
      });
      db = new SQL.Database();
      result = { success: true };
    } else if (method === 'execute') {
      if (!db) {
        throw new Error('Database not initialized');
      }
      db.run(args[0]);
      result = { success: true };
    } else if (method === 'query') {
      if (!db) {
        throw new Error('Database not initialized');
      }
      const stmt = db.prepare(args[0]);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      result = { success: true, rows };
    }
    
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
});

console.log('✅ SQLite Service Worker loaded');
