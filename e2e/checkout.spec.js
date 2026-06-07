const { test, expect } = require('@playwright/test');
const { setupCheckoutMocks, MOCK_USER, MOCK_CART_ID } = require('./fixtures/checkoutMocks');

async function waitForApp(page) {
	await page.waitForSelector('#app', { state: 'attached', timeout: 45000 });
}

async function loginAndOpenCart(page) {
	await page.goto('/client/login?redirect=/cart', { waitUntil: 'domcontentloaded' });
	await waitForApp(page);

	await page.locator('.aio-login__input[type="email"]').fill('cliente@test.com');
	await page.locator('.aio-login__input[type="password"]').fill('password123');
	await page.locator('.aio-login__submit').click();

	await expect(page).toHaveURL(/\/cart/, { timeout: 30000 });
}

test.describe('Checkout con API mock', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.clear();
			window.sessionStorage.clear();
		});
	});

	test('login desde carrito y muestra productos', async ({ page }) => {
		await setupCheckoutMocks(page);

		await loginAndOpenCart(page);

		await expect(page.locator('.aio-cart-page__name')).toContainText('Producto E2E');
		await expect(page.locator('.aio-cart-page__confirm-btn')).toBeVisible();
	});

	test('aplica cupón en el resumen del carrito', async ({ page }) => {
		await setupCheckoutMocks(page, { withCouponApply: true });

		await loginAndOpenCart(page);

		await page.locator('#cart-coupon-input').fill('ALLINONE10');
		await page.locator('.aio-cart-coupon__btn').filter({ hasText: 'Aplicar' }).click();

		await expect(page.locator('.aio-cart-coupon__applied')).toContainText('ALLINONE10', { timeout: 10000 });
		await expect(page.locator('.aio-cart-page__summary-row--discount')).toBeVisible();
	});

	test('confirmar compra abre diálogo de confirmación', async ({ page }) => {
		await setupCheckoutMocks(page);

		await loginAndOpenCart(page);
		await page.locator('.aio-cart-page__confirm-btn').click();

		await expect(page.locator('.aio-modal')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('¿Confirmar orden?')).toBeVisible();
	});

	test('confirmar compra redirige al historial de pedidos', async ({ page }) => {
		await setupCheckoutMocks(page, { withPaymentFlow: true });

		await loginAndOpenCart(page);

		await page.locator('.aio-cart-page__confirm-btn').click();
		await page.locator('.aio-modal__btn--primary').click();

		await expect(page).toHaveURL(/\/account\/order-history/, { timeout: 30000 });
		await expect(page.locator('.aio-account-panel__title')).toContainText('Historial de pedidos');
		await expect(page.locator('.aio-account-orders__order-id')).toContainText(`Orden #${MOCK_CART_ID}`);
	});

	test('ValidatePayment confirma pago y redirige al historial', async ({ page }) => {
		await setupCheckoutMocks(page, { withPaymentFlow: true, orderStatus: 3 });

		await page.addInitScript((user, cartId) => {
			window.localStorage.setItem('id_users', String(user.id_users));
			window.localStorage.setItem('id_orden', String(cartId));
			window.localStorage.setItem('email', user.email);
			window.localStorage.setItem('name_user', user.name_user);
			window.localStorage.setItem('last_name_user', user.last_name_user);
			window.localStorage.setItem('access_token', user.access_token);
		}, MOCK_USER, MOCK_CART_ID);

		await page.goto(
			`/payment/ValidatePayment?id=pay-mock-id&clientTransactionId=${MOCK_CART_ID}@145636`,
			{ waitUntil: 'domcontentloaded' }
		);
		await waitForApp(page);

		await expect(page.locator('.aio-payment-validate__title')).toContainText('Verificando pago');
		await expect(page.locator('.aio-payment-validate__title')).toContainText('¡Gracias por tu compra!', { timeout: 10000 });
		await expect(page).toHaveURL(/\/account\/order-history/, { timeout: 20000 });
		await expect(page.locator('.aio-account-panel__title')).toContainText('Historial de pedidos');
	});
});
