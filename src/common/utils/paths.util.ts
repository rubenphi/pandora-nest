import { join } from 'path';
import {
	existsSync,
	mkdirSync,
	copyFileSync,
	statSync,
	readdirSync,
	openSync,
	readSync,
	closeSync,
} from 'fs';

/**
 * Valida si un archivo existe y tiene la cabecera mágica oficial de SQLite ("SQLite format 3\0")
 */
export function isValidSqlite(filePath: string): boolean {
	try {
		if (!existsSync(filePath) || statSync(filePath).size < 1000) return false;
		const fd = openSync(filePath, 'r');
		const buf = Buffer.alloc(16);
		readSync(fd, buf, 0, 16, 0);
		closeSync(fd);
		return buf.toString('utf8') === 'SQLite format 3\0';
	} catch (_) {
		return false;
	}
}

/**
 * Obtiene la ruta persistente base del sistema.
 * En Android/Capacitor, utiliza bridge.app.datadir() (context.getFilesDir()),
 * el cual es el directorio interno permanente de Android que NUNCA se borra
 * al actualizar la app.
 */
export function getPersistentBaseDir(): string {
	if (process.env.APP_DATA_DIR) {
		return process.env.APP_DATA_DIR;
	}
	try {
		// En el entorno de Capacitor Node.js, bridge provee acceso al datadir nativo
		const bridge = require('bridge');
		if (bridge && bridge.app && typeof bridge.app.datadir === 'function') {
			const nativeDataDir = bridge.app.datadir();
			if (nativeDataDir) {
				return nativeDataDir;
			}
		}
	} catch (_) {}
	return process.cwd();
}

/**
 * Directorio persistente para la base de datos SQLite.
 * Si es el primer arranque y existe una base de datos inicial pre-empaquetada
 * (para pruebas), se copia a la ruta persistente una única vez sin riesgo
 * de ser sobreescrita en futuras actualizaciones.
 */
function findPreloadedDb(dir: string, depth = 0): string | null {
	if (depth > 3 || !existsSync(dir)) return null;
	try {
		const entries = readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory() && entry.name !== 'pandora_storage') {
				const found = findPreloadedDb(fullPath, depth + 1);
				if (found) return found;
			} else if (entry.isFile() && entry.name === 'pandora.sqlite') {
				if (isValidSqlite(fullPath)) {
					return fullPath;
				}
			}
		}
	} catch (_) {}
	return null;
}

export function getDataDir(): string {
	const baseDir = getPersistentBaseDir();
	const persistentDataDir =
		process.env.DATA_DIR || join(baseDir, 'pandora_storage', 'data');

	if (!existsSync(persistentDataDir)) {
		mkdirSync(persistentDataDir, { recursive: true });
	}

	const targetDb = join(persistentDataDir, 'pandora.sqlite');

	// Ubicaciones posibles de la base de datos precargada (data/pandora.sqlite):
	// Capacitor Node.js extrae los assets en context.getFilesDir() / 'capawesome_nodejs' / 'nodejs-project'
	const seedCandidates = [
		join(__dirname, 'data', 'pandora.sqlite'),
		join(__dirname, '..', 'data', 'pandora.sqlite'),
		join(baseDir, 'capawesome_nodejs', 'nodejs-project', 'data', 'pandora.sqlite'),
		join(baseDir, 'public', 'nodejs', 'data', 'pandora.sqlite'),
		join(baseDir, 'nodejs-project', 'data', 'pandora.sqlite'),
		join(process.cwd(), 'data', 'pandora.sqlite'),
		join(process.cwd(), 'seed', 'pandora.sqlite'),
	];

	// Si no se encuentra en las rutas directas, buscar recursivamente en baseDir
	let foundCandidate: string | null = null;
	for (const candidate of seedCandidates) {
		if (existsSync(candidate) && candidate !== targetDb && isValidSqlite(candidate)) {
			foundCandidate = candidate;
			break;
		}
	}

	if (!foundCandidate) {
		foundCandidate = findPreloadedDb(baseDir);
	}

	if (foundCandidate && isValidSqlite(foundCandidate)) {
		try {
			const candidateStat = statSync(foundCandidate);
			const targetExists = existsSync(targetDb);
			const targetValid = targetExists && isValidSqlite(targetDb);
			const targetSize = targetExists ? statSync(targetDb).size : 0;
			console.log(
				`[Pandora Paths] Base de datos precargada detectada en: ${foundCandidate} (${candidateStat.size} bytes). Target actual: ${targetDb} (${targetSize} bytes, valida: ${targetValid})`,
			);

			// Copiar si targetDb no existe o no es valida, O si targetDb es la BD vacía inicial (< 5MB) y candidate tiene data completa (> 10MB)
			if (!targetValid || (targetSize < 5000000 && candidateStat.size > 10000000)) {
				console.log(
					`[Pandora Paths] Copiando base de datos con toda la data (${candidateStat.size} bytes) a ${targetDb}...`,
				);
				copyFileSync(foundCandidate, targetDb);
				console.log(`[Pandora Paths] Base de datos con toda la data copiada con éxito.`);
			}
		} catch (e) {
			console.error('[Pandora Paths] Error al copiar base de datos precargada:', e);
		}
	} else {
		console.log(
			'[Pandora Paths] No se encontró base de datos precargada. Se usará almacenamiento persistente.',
		);
	}

	return persistentDataDir;
}

/**
 * Directorio persistente para archivos subidos (fotos, evidencias, documentos).
 * Almacenado en la ruta permanente del sistema operativo para sobrevivir actualizaciones.
 */
export function getUploadsDir(): string {
	const baseDir = getPersistentBaseDir();
	const persistentUploadsDir =
		process.env.UPLOADS_DIR || join(baseDir, 'pandora_storage', 'uploads');

	if (!existsSync(persistentUploadsDir)) {
		mkdirSync(persistentUploadsDir, { recursive: true });
	}

	return persistentUploadsDir;
}

/**
 * Directorio del frontend web estático (para servir a otros dispositivos vía navegador).
 */
export function getWwwDir(): string | null {
	const baseDir = getPersistentBaseDir();

	const candidates = [
		join(__dirname, 'www'),
		join(__dirname, '..', 'www'),
		join(__dirname, '..', '..', 'www'),
		join(process.cwd(), 'www'),
		join(process.cwd(), 'dist', 'bundle', 'www'),
		join(process.cwd(), '..', 'pandora-frontend', 'dist'),
		join(process.cwd(), '..', 'pandora-frontend', 'public', 'nodejs', 'www'),
		join(baseDir, 'www'),
		join(baseDir, 'capawesome_nodejs', 'nodejs-project', 'www'),
		join(baseDir, 'public', 'nodejs', 'www'),
		join(baseDir, 'nodejs-project', 'www'),
	];

	for (const candidate of candidates) {
		if (existsSync(candidate) && existsSync(join(candidate, 'index.html'))) {
			return candidate;
		}
	}

	// Búsqueda recursiva segura en baseDir o process.cwd si aún no se encuentra
	function findWwwRecursive(dir: string, depth = 0): string | null {
		if (depth > 3 || !existsSync(dir)) return null;
		try {
			const entries = readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				if (
					entry.isDirectory() &&
					entry.name !== 'pandora_storage' &&
					entry.name !== 'node_modules' &&
					entry.name !== '.git'
				) {
					if (entry.name === 'www' && existsSync(join(fullPath, 'index.html'))) {
						return fullPath;
					}
					const found = findWwwRecursive(fullPath, depth + 1);
					if (found) return found;
				}
			}
		} catch (_) {}
		return null;
	}

	return findWwwRecursive(baseDir) || findWwwRecursive(process.cwd());
}
