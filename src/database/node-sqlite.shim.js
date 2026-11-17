const { DatabaseSync } = require('node:sqlite');

function createNodeSqliteShim() {
  class Database {
    constructor(filename, callback) {
      try {
        this.db = new DatabaseSync(filename);
        if (typeof callback === 'function') {
          process.nextTick(() => callback(null));
        }
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback(err));
        } else {
          throw err;
        }
      }
    }

    run(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      try {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...(params || []));
        const context = {
          lastID: result.lastInsertRowid,
          changes: result.changes
        };
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(context, null));
        }
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback(err));
        }
      }
      return this;
    }

    all(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      try {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...(params || []));
        const context = {
          lastID: 0,
          changes: 0
        };
        if (typeof callback === 'function') {
          process.nextTick(() => callback.call(context, null, rows));
        }
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback(err, null));
        }
      }
      return this;
    }

    close(callback) {
      try {
        this.db.close();
        if (typeof callback === 'function') {
          process.nextTick(() => callback(null));
        }
      } catch (err) {
        if (typeof callback === 'function') {
          process.nextTick(() => callback(err));
        }
      }
    }
  }

  const shim = {
    verbose: () => shim,
    Database,
    OPEN_READONLY: 1,
    OPEN_READWRITE: 2,
    OPEN_CREATE: 4
  };

  return shim;
}

module.exports = { createNodeSqliteShim };
