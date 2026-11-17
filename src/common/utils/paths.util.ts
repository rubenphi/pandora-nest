import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export function getUploadsDir(): string {
	const dir =
		process.env.UPLOADS_DIR ||
		join(process.env.APP_DATA_DIR || process.cwd(), 'uploads');
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	return dir;
}

export function getDataDir(): string {
	const dir =
		process.env.APP_DATA_DIR ||
		process.env.DATA_DIR ||
		join(process.cwd(), 'data');
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	return dir;
}

