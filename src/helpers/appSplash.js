const SPLASH_ID = 'app-splash';
const HIDE_CLASS = 'app-splash--hide';

export function removeAppSplash() {
	const splash = document.getElementById(SPLASH_ID);
	if (!splash) {
		return;
	}

	splash.classList.add(HIDE_CLASS);
	window.setTimeout(() => {
		if (splash.parentNode) {
			splash.parentNode.removeChild(splash);
		}
	}, 450);
}
