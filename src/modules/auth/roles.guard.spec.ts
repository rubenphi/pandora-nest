import { RolesGuard } from './guards/roles.guard';

describe('RolesGuard', () => {
	it('should be defined', () => {
		expect(new RolesGuard(null)).toBeDefined();
	});
});
