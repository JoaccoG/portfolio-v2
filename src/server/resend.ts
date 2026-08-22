const TIMEOUT_MS = 10_000;

export async function resend(
	path: string,
	key: string,
	init: RequestInit = {},
): Promise<Response | null> {
	try {
		const res = await fetch(`https://api.resend.com${path}`, {
			...init,
			headers: { Authorization: `Bearer ${key}`, ...init.headers },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok && res.status !== 404) {
			const detail = await res
				.clone()
				.text()
				.catch(() => '');
			console.error(
				`[resend] ${init.method ?? 'GET'} ${path.split('/')[1]} → ${res.status} ${detail.slice(0, 300)}`,
			);
		}
		return res;
	} catch (error) {
		console.error(
			`[resend] ${init.method ?? 'GET'} ${path.split('/')[1]} failed: ${error instanceof Error ? error.name : 'unknown'}`,
		);
		return null;
	}
}
