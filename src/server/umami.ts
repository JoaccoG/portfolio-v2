export const UMAMI_SCRIPT = 'https://cloud.umami.is/script.js';
export const UMAMI_COLLECT = 'https://gateway.umami.is/api/send';

const PASS = [
	'content-type',
	'user-agent',
	'x-umami-website-id',
	'x-umami-hostname',
	'x-umami-cache',
];

const GEO: [string, string][] = [
	['cf-ipcountry', 'x-umami-client-country'],
	['cf-region-code', 'x-umami-client-region'],
	['cf-ipcity', 'x-umami-client-city'],
];

export function collectHeaders(request: Request, ip: string): Headers {
	const out = new Headers();
	for (const name of PASS) {
		const value = request.headers.get(name);
		if (value) out.set(name, value);
	}
	if (ip && ip !== 'unknown') out.set('x-umami-client-ip', ip);
	const country = request.headers.get('cf-ipcountry');
	if (country && country !== 'XX' && country !== 'T1') {
		for (const [from, to] of GEO) {
			const value = request.headers.get(from);
			if (value) out.set(to, value);
		}
	}
	return out;
}
