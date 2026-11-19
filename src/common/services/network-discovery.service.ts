import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class NetworkDiscoveryService implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(NetworkDiscoveryService.name);
	private primaryIp = '127.0.0.1';
	private availableIps: string[] = [];

	onApplicationBootstrap() {
		this.detectNetworkIps();
	}

	onApplicationShutdown() {}

	/**
	 * Detecta todas las direcciones IP IPv4 disponibles en las interfaces de red.
	 */
	public detectNetworkIps(): { primaryIp: string; allIps: string[] } {
		const interfaces = os.networkInterfaces();
		const detectedIps: { ip: string; iface: string; priority: number }[] = [];

		for (const ifaceName in interfaces) {
			const ifaceList = interfaces[ifaceName];
			if (!ifaceList) continue;

			for (const iface of ifaceList) {
				const isIpv4 =
					iface.family === 'IPv4' ||
					(iface.family as any) === 4 ||
					(iface.family as any) === '4';

				if (isIpv4 && !iface.internal && iface.address !== '127.0.0.1') {
					const nameLower = ifaceName.toLowerCase();
					let priority = 10; // prioridad base

					// Alta prioridad: Wi-Fi y Hotspot
					if (nameLower.startsWith('wlan') || nameLower.includes('wi-fi') || nameLower.includes('wireless')) {
						priority = 100;
					} else if (nameLower.startsWith('ap') || nameLower.startsWith('rndis') || nameLower.includes('hotspot')) {
						priority = 90;
					} else if (nameLower.startsWith('eth') || nameLower.startsWith('en') || nameLower.includes('ethernet')) {
						priority = 50;
					}

					detectedIps.push({ ip: iface.address, iface: ifaceName, priority });
				}
			}
		}

		// Ordenar por prioridad descendente
		detectedIps.sort((a, b) => b.priority - a.priority);

		this.availableIps = detectedIps.map((d) => d.ip);
		this.primaryIp = this.availableIps.length > 0 ? this.availableIps[0] : '127.0.0.1';

		this.logger.log(
			`[Network] IP principal detectada: ${this.primaryIp} (Todas: ${this.availableIps.join(', ') || '127.0.0.1'})`,
		);

		return { primaryIp: this.primaryIp, allIps: this.availableIps };
	}

	/**
	 * Obtiene información de red actual para la UI del frontend
	 */
	public getServerNetworkInfo(port: number | string = 3000) {
		this.detectNetworkIps();
		const primaryUrl = `http://${this.primaryIp}:${port}`;

		return {
			ip: this.primaryIp,
			allIps: this.availableIps,
			port: Number(port),
			primaryUrl,
			urls: [primaryUrl],
		};
	}
}

