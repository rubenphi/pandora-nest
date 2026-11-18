// Shim transparente para utilizar el driver nativo de node:sqlite
// compatible con la interfaz que TypeORM espera de sqlite3.
let DatabaseSyncClass: any;
try {
	const sqlite = require('node:sqlite');
	DatabaseSyncClass = sqlite.DatabaseSync;
} catch (_) {}

export function createNodeSqliteShim() {
	if (!DatabaseSyncClass) {
		try {
			const sqlite = require('node:sqlite');
			DatabaseSyncClass = sqlite.DatabaseSync;
		} catch (err) {
			console.error('Failed to load node:sqlite module:', err);
		}
	}

	class Database {
		private db: any;
		constructor(filename: string, callback?: (err: any) => void) {
			try {
				this.db = new DatabaseSyncClass(filename);
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

		run(sql: string, params?: any, callback?: any) {
			if (typeof params === 'function') {
				callback = params;
				params = [];
			}
			try {
				const stmt = this.db.prepare(sql);
				const result = stmt.run(...(params || []));
				const context = {
					lastID: result.lastInsertRowid,
					changes: result.changes,
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

		all(sql: string, params?: any, callback?: any) {
			if (typeof params === 'function') {
				callback = params;
				params = [];
			}
			try {
				const stmt = this.db.prepare(sql);
				const rows = stmt.all(...(params || []));
				const context = {
					lastID: 0,
					changes: 0,
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

		close(callback?: (err: any) => void) {
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

	const shim: any = {
		verbose: () => shim,
		Database,
		OPEN_READONLY: 1,
		OPEN_READWRITE: 2,
		OPEN_CREATE: 4,
	};

	return shim;
}

