type Props = Record<string, string>;
type Umami = { track: (name: string, data?: Props) => Promise<void> };

const PREFIX = 'data-ev-';

export function track(name: string, data?: Props): void {
	const umami = (window as unknown as { umami?: Umami }).umami;
	if (!umami) return;
	umami
		.track(name, data && Object.keys(data).length ? data : undefined)
		.catch(() => {});
}

const propsOf = (el: Element): Props => {
	const data: Props = {};
	for (const attr of el.getAttributeNames()) {
		if (!attr.startsWith(PREFIX)) continue;
		const value = el.getAttribute(attr);
		if (value) data[attr.slice(PREFIX.length)] = value;
	}
	return data;
};

export function initStats(): void {
	document.addEventListener(
		'click',
		(event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const el = target.closest('[data-ev]');
			const name = el?.getAttribute('data-ev');
			if (el && name) track(name, propsOf(el));
		},
		{ capture: true },
	);
}
