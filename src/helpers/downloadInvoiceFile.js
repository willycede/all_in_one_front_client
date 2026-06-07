import api from 'Api';

export async function downloadBlobResponse(response, fallbackFilename) {
	const disposition = response.headers['content-disposition'] || '';
	const match = disposition.match(/filename="([^"]+)"/i);
	const filename = (match && match[1]) || fallbackFilename;
	const blob = new Blob([response.data], {
		type: response.headers['content-type'] || 'application/octet-stream',
	});
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

export async function downloadAdminInvoice(orderId, type) {
	const response = await api.get(`/api/admin/invoices/${orderId}/download/${type}`, {
		responseType: 'blob',
	});
	await downloadBlobResponse(response, `factura-${orderId}.${type}`);
}

export async function downloadUserInvoice(orderId, userId, type) {
	const response = await api.get(`/api/order_history/download_invoice/${orderId}/${userId}/${type}`, {
		responseType: 'blob',
	});
	await downloadBlobResponse(response, `factura-${orderId}.${type}`);
}
