type Slot = { count: number; start: number };

export type LimiterOptions = {
	windowMs: number;
	maxPerWindow: number;
	maxGlobal: number;
	maxKeys: number;
};

export type Limiter = {
	overLimit: (key: string, now: number) => boolean;
};

export const clientKey = (
	request: Request,
	clientAddress: string | undefined,
): string => {
	const forwarded = request.headers.get('x-forwarded-for');
	const last = forwarded?.split(',').at(-1)?.trim();
	return last || clientAddress || 'unknown';
};

export function createLimiter(options: LimiterOptions): Limiter {
	const { windowMs, maxPerWindow, maxGlobal, maxKeys } = options;
	const hits = new Map<string, Slot>();
	let globalSlot: Slot = { count: 0, start: 0 };
	return {
		overLimit(key, now) {
			if (now - globalSlot.start > windowMs) {
				globalSlot = { count: 0, start: now };
			}
			if (++globalSlot.count > maxGlobal) return true;
			const slot = hits.get(key);
			if (!slot || now - slot.start > windowMs) {
				if (hits.size >= maxKeys) {
					for (const [k, v] of hits) {
						if (now - v.start > windowMs) hits.delete(k);
					}
					while (hits.size >= maxKeys) {
						const oldest = hits.keys().next().value;
						if (oldest === undefined) break;
						hits.delete(oldest);
					}
				}
				hits.set(key, { count: 1, start: now });
				return false;
			}
			return ++slot.count > maxPerWindow;
		},
	};
}
