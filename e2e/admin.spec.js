const { test, expect } = require('@playwright/test');
const {
	setupAdminMocks,
	seedAdminSession,
	seedClientSession,
	MOCK_COUPONS,
} = require('./fixtures/adminMocks');

async function waitForApp(page) {
	await page.waitForSelector('#app', { state: 'attached', timeout: 45000 });
}

async function openAdminPage(page, path) {
	await setupAdminMocks(page);
	await seedAdminSession(page);
	await page.goto(path, { waitUntil: 'domcontentloaded' });
	await waitForApp(page);
}

test.describe('Panel admin — acceso', () => {
	test('cliente sin rol admin es redirigido desde /admin-panel', async ({ page }) => {
		await setupAdminMocks(page);
		await seedClientSession(page);
		await page.goto('/admin-panel/reports', { waitUntil: 'domcontentloaded' });
		await waitForApp(page);

		await expect(page).toHaveURL(/denied=admin|admin-login/, { timeout: 30000 });
	});
});

test.describe('Panel admin — secciones', () => {
	test('reportes muestra estadísticas', async ({ page }) => {
		await openAdminPage(page, '/admin-panel/reports');

		await expect(page.locator('.aio-admin-stat__value').first()).toBeVisible({ timeout: 30000 });
		await expect(page.locator('.aio-admin-stat__label').filter({ hasText: 'Pedidos hoy' })).toBeVisible();
	});

	test('cupones lista códigos promocionales', async ({ page }) => {
		await openAdminPage(page, '/admin-panel/coupons');

		await expect(page.locator('.aio-admin-table')).toBeVisible({ timeout: 30000 });
		await expect(page.locator('.aio-admin-table')).toContainText(MOCK_COUPONS.items[0].code);
	});

	test('documentos muestra revisión pendiente', async ({ page }) => {
		await openAdminPage(page, '/admin-panel/documents');

		await expect(page.locator('.aio-admin-docs__list')).toBeVisible({ timeout: 30000 });
		await expect(page.locator('.aio-admin-docs__doc-type')).toContainText(/cedula/i);
	});

	test('facturas muestra listado', async ({ page }) => {
		await openAdminPage(page, '/admin-panel/invoices');

		await expect(page.locator('.aio-admin-page__title')).toContainText('Listado de facturas', { timeout: 30000 });
		await expect(page.locator('.aio-admin-page__subtitle')).toContainText(/Pedidos pagados|comprobantes/i);
	});

	test('alta de producto muestra formulario', async ({ page }) => {
		await openAdminPage(page, '/admin-panel/product-add');

		await expect(page.locator('.aio-admin__page-title')).toContainText('Nuevo producto', { timeout: 30000 });
		await expect(page.locator('main')).toContainText(/producto|Producto|Catálogo/i, { timeout: 30000 });
	});
});
