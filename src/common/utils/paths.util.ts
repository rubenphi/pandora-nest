import { join } from 'path';
import { existsSync, mkdirSync, copyFileSync } from 'fs';

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
export function getDataDir(): string {
	const baseDir = getPersistentBaseDir();
	const persistentDataDir =
		process.env.DATA_DIR || join(baseDir, 'pandora_storage', 'data');

	if (!existsSync(persistentDataDir)) {
		mkdirSync(persistentDataDir, { recursive: true });
	}

	const targetDb = join(persistentDataDir, 'pandora.sqlite');

	// Si aún no existe la base de datos persistente, verificar si se incluyó una precargada (para pruebas)
	if (!existsSync(targetDb)) {
		const seedCandidates = [
			join(process.cwd(), 'data', 'pandora.sqlite'),
			join(process.cwd(), 'seed', 'pandora.sqlite'),
		];
		for (const candidate of seedCandidates) {
			if (existsSync(candidate) && candidate !== targetDb) {
				try {
					copyFileSync(candidate, targetDb);
					break;
				} catch (_) {}
			}
		}
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
