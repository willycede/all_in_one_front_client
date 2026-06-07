const MOCK_USER = {
	id_users: 1,
	email: 'cliente@test.com',
	name_user: 'Cliente',
	last_name_user: 'Prueba',
	identification_number: '1234567890',
	id_user_rol: 2,
	id_rol: 2,
	id_company_user: 1,
	access_token: 'mock-jwt-token-e2e',
};

const MOCK_CART_ID = 99;

const MOCK_CART_ITEM = {
	id_details: 1,
	id_shopping_car: MOCK_CART_ID,
	id_product: 1,
	name: 'Producto E2E',
	description: 'Producto de prueba automatizada',
	details_price: 100,
	details_quantity: 1,
	details_subtotal: 100,
	details_iva: 15,
	details_total: 115,
	details_discount: 0,
	url: '/static/images/logo/AIO_LOGO_NAME_BLACK&COLOR.png',
	name_img: 'Producto E2E',
	required_documents: '',
	required_documents_array: [],
};

const MOCK_ORDER_HISTORY_ITEM = {
	id_shopping_car: MOCK_CART_ID,
	status: 2,
	status_invoice: 0,
	shopping_car_total: 115,
	created_at: '2026-06-06T12:00:00.000Z',
	url_payphone: 'https://payphone.mock/checkout',
};

function jsonResponse(data, status = 200) {
	return {
		status,
		contentType: 'application/json',
		body: JSON.stringify({ error: '', data }),
	};
}

function rawJsonResponse(data, status = 200) {
	return {
		status,
		contentType: 'application/json',
		body: JSON.stringify(data),
	};
}

function errorResponse(message, status = 422) {
	return {
		status,
		contentType: 'application/json',
		body: JSON.stringify({ error: { message }, data: {} }),
	};
}

async function setupCheckoutMocks(page, options = {}) {
	const {
		couponDiscount = 0,
		couponCode = '',
		withCouponApply = false,
		withPaymentFlow = false,
		orderStatus = 2,
	} = options;

	const orderHistoryItem = {
		...MOCK_ORDER_HISTORY_ITEM,
		status: orderStatus,
	};

	await page.route('**/api/**', async (route) => {
		const url = route.request().url();
		const method = route.request().method();

		if (url.includes('/api/users/login') && method === 'POST') {
			await route.fulfill(jsonResponse(MOCK_USER));
			return;
		}

		if (url.match(/\/api\/users\/\d+$/) && method === 'GET') {
			await route.fulfill(jsonResponse(MOCK_USER));
			return;
		}

		if (url.includes('/api/favorites/')) {
			await route.fulfill(jsonResponse([]));
			return;
		}

		if (url.includes('/api/shoppingcar/get_shop/') && method === 'GET') {
			await route.fulfill(jsonResponse([{
				id_shopping_car: MOCK_CART_ID,
				id_user: MOCK_USER.id_users,
				coupon_code: couponCode || null,
				coupon_discount: couponDiscount,
				status: 1,
			}]));
			return;
		}

		if (url.includes('/api/shoppingcar/get_shop_by_id/') && method === 'GET') {
			await route.fulfill(jsonResponse([{
				id_shopping_car: MOCK_CART_ID,
				shopping_car_total: 115,
				status: orderStatus,
			}]));
			return;
		}

		if (url.includes('/api/shoppingcar/get_shopDetails/') && method === 'GET') {
			await route.fulfill(jsonResponse([MOCK_CART_ITEM]));
			return;
		}

		if (url.includes('/api/product_documents/cart-detail/') && method === 'GET') {
			await route.fulfill(jsonResponse([]));
			return;
		}

		if (url.includes('/api/coupons/apply') && method === 'POST') {
			if (withCouponApply) {
				await route.fulfill(jsonResponse({
					valid: true,
					coupon_code: 'ALLINONE10',
					coupon_description: '10% de descuento en tu compra',
					discount_amount: 10,
					discount_type: 'percent',
					discount_value: 10,
					subtotal: 100,
				}));
				return;
			}
			await route.fulfill(errorResponse('Cupón no configurado en mock'));
			return;
		}

		if (url.includes('/api/coupons/remove/') && method === 'DELETE') {
			await route.fulfill(jsonResponse({ removed: true }));
			return;
		}

		if (url.includes('/api/shoppingcar/payphone/confirm') && method === 'POST') {
			await route.fulfill(rawJsonResponse({
				url: { statusCode: 1 },
				errorCode: 200,
				success: true,
			}));
			return;
		}

		if (url.includes('/api/shoppingcar/payphone') && method === 'POST') {
			await route.fulfill(rawJsonResponse({
				url: 'https://payphone.mock/checkout',
				errorCode: 200,
			}));
			return;
		}

		if (url.includes('/api/shoppingcar/get_comprobante_electronico/') && method === 'GET') {
			await route.fulfill(rawJsonResponse({
				claveAcceso: 'MOCK-CLAVE-ACCESO-E2E',
				pathPdf: '/mock/factura.pdf',
				pathXml: '/mock/factura.xml',
			}));
			return;
		}

		if (url.includes('/api/shoppingcar/payphone/invoice/state') && method === 'POST') {
			await route.fulfill(jsonResponse({ updated: true }));
			return;
		}

		if (url.includes('/api/shoppingcar/sendmail_factura') && method === 'POST') {
			await route.fulfill(jsonResponse({ sent: true }));
			return;
		}

		if (url.includes('/api/shoppingcar/sendmail') && method === 'POST') {
			await route.fulfill(jsonResponse({ sent: true }));
			return;
		}

		if (url.includes('/api/shoppingcar/pay_shop') && method === 'POST') {
			await route.fulfill(jsonResponse({ status: 200 }));
			return;
		}

		if (url.includes('/api/order_history/get_order_history/') && method === 'GET') {
			await route.fulfill(jsonResponse({
				items: [orderHistoryItem],
				pagination: {
					page: 1,
					limit: 10,
					total: 1,
					totalPages: 1,
					hasPrevPage: false,
					hasNextPage: false,
				},
			}));
			return;
		}

		if (withPaymentFlow) {
			await route.fulfill(jsonResponse({}));
			return;
		}

		await route.fulfill(jsonResponse({}));
	});
}

module.exports = {
	MOCK_USER,
	MOCK_CART_ID,
	setupCheckoutMocks,
};
