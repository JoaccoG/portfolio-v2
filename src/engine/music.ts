const TRACKS = [
	'/music/metropolitan-morning.mp3',
	'/music/the-copy-desk.mp3',
	'/music/ledger-smoke.mp3',
	'/music/midnight-newsroom.mp3',
];

export function initMusic(): void {
	const doc = document.documentElement;
	const toggles = document.querySelectorAll<HTMLElement>('[data-sound-toggle]');
	if (toggles.length === 0) return;
	const label = document.querySelector<HTMLElement>('[data-sound-label]');
	const audio = new Audio();
	audio.preload = 'none';
	audio.volume = 0.6;
	let index = 0;
	let playing = false;
	let failures = 0;
	const render = () => {
		for (const toggle of toggles) {
			toggle.setAttribute('aria-pressed', String(playing));
		}
		if (label) {
			label.textContent =
				(playing ? label.dataset.audible : label.dataset.silent) ?? '';
		}
		doc.style.setProperty('--sealPlay', playing ? 'running' : 'paused');
	};
	const play = () => {
		const track = TRACKS[index];
		if (!track) return;
		if (!audio.src.endsWith(track)) audio.src = track;
		audio.play().catch(() => skip());
	};
	const skip = () => {
		failures++;
		if (failures >= TRACKS.length) {
			playing = false;
			render();
			return;
		}
		index = (index + 1) % TRACKS.length;
		if (playing) play();
	};
	audio.addEventListener('ended', () => {
		index = (index + 1) % TRACKS.length;
		if (playing) play();
	});
	audio.addEventListener('error', skip);
	audio.addEventListener('playing', () => {
		failures = 0;
	});
	const toggle = () => {
		playing = !playing;
		if (playing) play();
		else audio.pause();
		render();
	};
	for (const el of toggles) el.addEventListener('click', toggle);
	render();
}
