const { test, expect } = require('@playwright/test');

async function waitForApp(page) {
	await page.waitForSelector('#app', { state: 'attached', timeout: 45000 });
}

test.describe('Catálogo', () => {
	test('muestra la página de productos', async ({ page }) => {
		await page.goto('/products?page=1', { waitUntil: 'domcontentloaded' });
		await waitForApp(page);
		await expect(page.locator('.aio-shop__title')).toContainText(/productos/i, { timeout: 30000 });
	});

	test('sidebar de filtros visible', async ({ page }) => {
		await page.goto('/products', { waitUntil: 'domcontentloaded' });
		await waitForApp(page);
		await expect(page.locator('.aio-shop-sidebar')).toBeVisible({ timeout: 30000 });
		await expect(page.locator('.aio-shop-sidebar__search-input')).toBeVisible();
	});
});

test.describe('Autenticación', () => {
	test('carrito redirige a login sin sesión', async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.clear();
			window.sessionStorage.clear();
		});
		await page.goto('/cart', { waitUntil: 'domcontentloaded' });
		await waitForApp(page);
		await expect(page).toHaveURL(/\/client\/login/, { timeout: 30000 });
		await expect(page.url()).toContain('redirect=');
	});

	test('login no se muestra si ya hay sesión activa', async ({ page }) => {
		const { setupCheckoutMocks } = require('./fixtures/checkoutMocks');

		await setupCheckoutMocks(page);

		await page.goto('/mainPage', { waitUntil: 'domcontentloaded' });
		await page.evaluate(() => {
			window.localStorage.clear();
			window.sessionStorage.clear();
		});

		await page.goto('/client/login?redirect=/cart', { waitUntil: 'domcontentloaded' });
		await waitForApp(page);

		await page.locator('.aio-login__input[type="email"]').fill('cliente@test.com');
		await page.locator('.aio-login__input[type="password"]').fill('password123');
		await page.locator('.aio-login__submit').click();

		await expect(page).toHaveURL(/\/cart/, { timeout: 30000 });

		await page.goto('/client/login', { waitUntil: 'domcontentloaded' });
		await expect(page).toHaveURL(/\/mainPage/, { timeout: 30000 });
	});
});

test.describe('Home', () => {
	test('carga la página principal', async ({ page }) => {
		await page.goto('/mainPage', { waitUntil: 'domcontentloaded' });
		await waitForApp(page);
		await expect(page.locator('#app').first()).toBeVisible();
	});
});
