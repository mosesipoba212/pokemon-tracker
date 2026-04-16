/* =========================================================
   DATA/CACHE.JS — IndexedDB pokemon cache + team storage
   Replaces sql.js entirely. Three-tier: mem → IDB → network.
   ========================================================= */
'use strict';

const _DB_NAME    = 'poketracker';
const _DB_VERSION = 1;
let   _idb        = null;
const _idbMem     = Object.create(null);   // in-memory fast path

function _openDB() {
  if (_idb) return Promise.resolve(_idb);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(_DB_NAME, _DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pokemon')) {
        db.createObjectStore('pokemon', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('teams')) {
        const ts = db.createObjectStore('teams', { keyPath: 'id', autoIncrement: true });
        ts.createIndex('byName', 'name', { unique: false });
      }
    };
    req.onsuccess = e => { _idb = e.target.result; resolve(_idb); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function getCached(name) {
  if (_idbMem[name]) return _idbMem[name];
  const db = await _openDB();
  return new Promise(resolve => {
    const req = db.transaction('pokemon', 'readonly').objectStore('pokemon').get(name);
    req.onsuccess = e => {
      const row = e.target.result;
      if (row) { _idbMem[name] = row.data; resolve(row.data); }
      else resolve(null);
    };
    req.onerror = () => resolve(null);
  });
}

async function setCached(name, data) {
  _idbMem[name] = data;
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pokemon', 'readwrite');
    tx.objectStore('pokemon').put({ name, data });
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

async function dbSaveTeam(teamName, pokemonNames) {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('teams', 'readwrite');
    tx.objectStore('teams').add({
      name:         teamName,
      pokemonNames: pokemonNames,
      savedAt:      new Date().toLocaleString(),
    });
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

async function dbLoadTeams() {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('teams', 'readonly').objectStore('teams').getAll();
    req.onsuccess = e => resolve([...e.target.result].reverse());  // newest first
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbDeleteTeam(id) {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('teams', 'readwrite');
    tx.objectStore('teams').delete(id);
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

/**
 * One-time migration: import teams from old localStorage format → IndexedDB.
 * Also removes old sql.js blob and legacy poke_cache_* entries.
 */
async function migrateFromOldStorage() {
  // 1. Migrate teams from localStorage 'poke_teams'
  try {
    const raw = localStorage.getItem('poke_teams');
    if (raw) {
      const teams = JSON.parse(raw);
      if (Array.isArray(teams) && teams.length > 0) {
        for (const t of teams) {
          const pokemonNames = JSON.parse(t.data || '[]');
          await dbSaveTeam(t.name || 'Imported Team', pokemonNames);
        }
        localStorage.removeItem('poke_teams');
        console.log('[Cache] Migrated', teams.length, 'team(s) to IndexedDB');
      }
    }
  } catch (e) {
    console.warn('[Cache] Team migration failed:', e.message);
  }

  // 2. Migrate individual pokemon cache entries (poke_cache_*)
  try {
    const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('poke_cache_'));
    for (const key of cacheKeys) {
      try {
        const d = JSON.parse(localStorage.getItem(key));
        if (d && d.name && d.artwork) {
          await setCached(d.name, d);
        }
        localStorage.removeItem(key);
      } catch (_) { localStorage.removeItem(key); }
    }
    if (cacheKeys.length > 0) {
      console.log('[Cache] Migrated', cacheKeys.length, 'pokemon entries to IndexedDB');
    }
  } catch (e) {
    console.warn('[Cache] Pokemon cache migration failed:', e.message);
  }

  // 3. Remove old sql.js blob
  localStorage.removeItem('poketracker_db');
}
