const MOCK_ADMIN = {
	id_users: 1,
	email: 'admin@test.com',
	name_user: 'Admin',
	last_name_user: 'Prueba',
	identification_number: '1234567890',
	id_user_rol: 1,
	id_rol: 1,
	id_company_user: 1,
	access_token: 'mock-admin-jwt-e2e',
};

const MOCK_COUPONS = {
	items: [
		{
			id_coupon: 1,
			code: 'ALLINONE10',
			description: '10% de descuento',
			discount_type: 'percent',
			discount_value: 10,
			min_purchase: 0,
			max_uses: null,
			used_count: 2,
			valid_from: null,
			valid_until: null,
			status: 1,
		},
	],
};

const MOCK_DOCUMENTS = {
	items: [
		{
			id: 1,
			document_type: 'cedula',
			document_url: '/uploads/documents/mock.pdf',
			file_name: 'cedula.pdf',
			verified: false,
			id_shopping_car: 99,
			product_name: 'Producto E2E',
			name_user: 'Cliente',
			last_name_user: 'Prueba',
			email: 'cliente@test.com',
			created_at: '2026-06-06T12:00:00.000Z',
		},
	],
	pagination: {
		page: 1,
		limit: 10,
		total: 1,
		totalPages: 1,
		hasPrevPage: false,
		hasNextPage: false,
	},
};

const MOCK_INVOICES = {
	items: [
		{
			id_shopping_car: 101,
			id_user: 2,
			shopping_car_total: 115,
			status: 3,
			status_invoice: 0,
			created_at: '2026-06-06T10:00:00.000Z',
			updated_at: '2026-06-06T11:00:00.000Z',
			name_user: 'Cliente',
			last_name_user: 'Prueba',
			email: 'cliente@test.com',
		},
	],
	pagination: {
		page: 1,
		limit: 10,
		total: 1,
		totalPages: 1,
		hasPrevPage: false,
		hasNextPage: false,
	},
};

function jsonResponse(data, status = 200) {
	return {
		status,
		contentType: 'application/json',
		body: JSON.stringify({ error: '', data }),
	};
}

function errorResponse(message, status = 403) {
	return {
		status,
		contentType: 'application/json',
		body: JSON.stringify({ error: { message }, data: {} }),
	};
}

async function setupAdminMocks(page) {
	await page.route('**/api/**', async (route) => {
		const url = route.request().url();
		const method = route.request().method();

		if (url.includes('/api/users/loginAdmin') && method === 'POST') {
			await route.fulfill(jsonResponse(MOCK_ADMIN));
			return;
		}

		if (url.includes('/api/admin/dashboard/stats') && method === 'GET') {
			await route.fulfill(jsonResponse({
				ordersToday: 3,
				revenue: 1250.5,
				productsCount: 24,
				clientsCount: 18,
				recentOrders: MOCK_INVOICES.items,
			}));
			return;
		}

		if (url.includes('/api/admin/invoices') && method === 'GET') {
			await route.fulfill(jsonResponse(MOCK_INVOICES));
			return;
		}

		if (url.includes('/api/admin/invoices/') && url.includes('/reprocess') && method === 'POST') {
			await route.fulfill(jsonResponse({ ...MOCK_INVOICES.items[0], status_invoice: 1 }));
			return;
		}

		if (url.includes('/api/coupons/admin/list') && method === 'GET') {
			await route.fulfill(jsonResponse(MOCK_COUPONS));
			return;
		}

		if (url.includes('/api/coupons/admin') && (method === 'POST' || method === 'PUT')) {
			await route.fulfill(jsonResponse({ id_coupon: 2, ...MOCK_COUPONS.items[0] }));
			return;
		}

		if (url.includes('/api/product_documents/admin/review') && method === 'GET') {
			await route.fulfill(jsonResponse(MOCK_DOCUMENTS));
			return;
		}

		if (url.includes('/api/products/undefined') && method === 'GET') {
			await route.fulfill(jsonResponse({
				items: [],
				pagination: {
					page: 1,
					limit: 12,
					total: 0,
					totalPages: 0,
					hasPrevPage: false,
					hasNextPage: false,
				},
			}));
			return;
		}

		if (url.includes('/api/catalogs/getCatalogs') && method === 'GET') {
			await route.fulfill(jsonResponse([]));
			return;
		}

		if (url.includes('/api/categories/getCategories/') && method === 'GET') {
			await route.fulfill(jsonResponse([]));
			return;
		}

		if (url.includes('/api/company/') && method === 'GET') {
			await route.fulfill(jsonResponse([{ id_company: 1, name: 'All in One' }]));
			return;
		}

		if (url.includes('/api/user_rol/') && method === 'GET') {
			await route.fulfill(jsonResponse([]));
			return;
		}

		if (url.includes('/api/generalCategories') && method === 'GET') {
			await route.fulfill(jsonResponse([]));
			return;
		}

		await route.fulfill(jsonResponse({}));
	});
}

async function seedAdminSession(page) {
	await page.addInitScript((admin) => {
		window.localStorage.setItem('access_token', admin.access_token);
		window.localStorage.setItem('id_users', String(admin.id_users));
		window.localStorage.setItem('id_rol', String(admin.id_rol));
		window.localStorage.setItem('email', admin.email);
		window.localStorage.setItem('name_user', admin.name_user);
		window.localStorage.setItem('last_name_user', admin.last_name_user);
		window.localStorage.setItem('identification_number', admin.identification_number);
	}, MOCK_ADMIN);
}

async function seedClientSession(page) {
	await page.addInitScript(() => {
		window.localStorage.setItem('access_token', 'mock-client-token');
		window.localStorage.setItem('id_users', '2');
		window.localStorage.setItem('id_rol', '2');
		window.localStorage.setItem('email', 'cliente@test.com');
	});
}

module.exports = {
	MOCK_ADMIN,
	MOCK_COUPONS,
	setupAdminMocks,
	seedAdminSession,
	seedClientSession,
};
