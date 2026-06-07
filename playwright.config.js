// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const PORT = process.env.PORT || 8080;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

module.exports = defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 1 : 0,
	workers: isCI ? 1 : undefined,
	timeout: 60000,
	reporter: 'list',
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
		? undefined
		: {
			command: isCI
				? `npx serve dist -s -l ${PORT}`
				: 'npm run serve',
			url: baseURL,
			reuseExistingServer: !isCI,
			timeout: 180000,
		},
});
