const BRAND = {
	primary: '#A96DFA',
	accent: '#CA1DFF',
	dark: '#1A1025',
	muted: '#6B6478',
	surface: '#F8F5FF',
	border: '#E8E0F5',
	white: '#FFFFFF',
};

const normalizeLocale = (locale) => (String(locale || '').toLowerCase().startsWith('en') ? 'en' : 'sp');

const COPY = {
	sp: {
		title: 'Confirmación de pedido — All in One',
		thanks: '¡Gracias por tu pedido!',
		hello: 'Hola @nombre_cliente, tu orden está lista para pagar.',
		orderNumber: 'Número de orden',
		date: 'Fecha',
		payIntro: 'Completa tu compra de forma segura con Payphone. El enlace estará disponible por tiempo limitado.',
		payNow: 'Pagar ahora',
		linkHint: 'Si el botón no funciona, copia este enlace en tu navegador:',
		itemsTitle: 'Detalle del pedido',
		product: 'Producto',
		qty: 'Cant.',
		lineTotal: 'Total',
		subtotal: (count) => `Subtotal (${count} productos)`,
		discount: 'Descuento',
		tax: 'IVA (15%)',
		totalDue: 'Total a pagar',
		footerOrders: 'También puedes ver tu pedido en',
		myOrders: 'Mis pedidos',
		footerAuto: 'Este es un correo automático, por favor no respondas a este mensaje.',
		subject: (orderNumber) => `ALL IN ONE - Pedido #${orderNumber}`,
	},
	en: {
		title: 'Order confirmation — All in One',
		thanks: 'Thank you for your order!',
		hello: 'Hi @nombre_cliente, your order is ready to pay.',
		orderNumber: 'Order number',
		date: 'Date',
		payIntro: 'Complete your purchase securely with Payphone. The link will be available for a limited time.',
		payNow: 'Pay now',
		linkHint: 'If the button does not work, copy this link into your browser:',
		itemsTitle: 'Order details',
		product: 'Product',
		qty: 'Qty.',
		lineTotal: 'Total',
		subtotal: (count) => `Subtotal (${count} items)`,
		discount: 'Discount',
		tax: 'VAT (15%)',
		totalDue: 'Total due',
		footerOrders: 'You can also view your order in',
		myOrders: 'My orders',
		footerAuto: 'This is an automated email, please do not reply.',
		subject: (orderNumber) => `ALL IN ONE - Order #${orderNumber}`,
	},
};

const htmldetalle = `
<tr>
  <td style="padding:14px 28px;border-bottom:1px solid ${BRAND.border};">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#2D2640;font-weight:500;">@nombre</td>
        <td width="72" align="center" style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.muted};">× @cantidad</td>
        <td width="110" align="right" style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#2D2640;font-weight:600;">@totaldetalle</td>
      </tr>
    </table>
  </td>
</tr>`;

function buildHtmlBody(locale) {
	const lang = normalizeLocale(locale);
	const t = COPY[lang];

	return `<!DOCTYPE html>
<html lang="${lang === 'en' ? 'en' : 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDE8F8;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#EDE8F8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%);border-radius:20px 20px 0 0;padding:36px 32px 28px;text-align:center;">
              <img src="@logo_url" alt="All in One" width="180" style="display:block;margin:0 auto 20px;border:0;outline:none;max-width:180px;height:auto;">
              <h1 style="margin:0;font-size:26px;line-height:1.3;font-weight:700;color:${BRAND.white};letter-spacing:-0.02em;">
                ${t.thanks}
              </h1>
              <p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.92);">
                ${t.hello}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.white};padding:32px 28px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:600;padding-bottom:4px;">${t.orderNumber}</td>
                        <td align="right" style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:600;padding-bottom:4px;">${t.date}</td>
                      </tr>
                      <tr>
                        <td style="font-size:18px;font-weight:700;color:${BRAND.dark};">#@numeroorden</td>
                        <td align="right" style="font-size:14px;color:#2D2640;">@fecha</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A4458;text-align:center;">
                ${t.payIntro}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <a href="@url_payphone" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%);color:${BRAND.white};text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:999px;box-shadow:0 8px 24px rgba(169,109,250,0.35);">
                      ${t.payNow}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <p style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.muted};">
                      ${t.linkHint}<br>
                      <a href="@url_payphone" style="color:${BRAND.primary};word-break:break-all;">@url_payphone</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.white};padding:0 28px 8px;">
              <h2 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND.muted};font-weight:700;">
                ${t.itemsTitle}
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="background-color:${BRAND.surface};padding:12px 28px;border-bottom:1px solid ${BRAND.border};">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">${t.product}</td>
                        <td width="72" align="center" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">${t.qty}</td>
                        <td width="110" align="right" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};font-weight:700;">${t.lineTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                @detalle
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.white};padding:20px 28px 32px;border-radius:0 0 20px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#4A4458;">@subtotal_label</td>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#2D2640;">$@subtotal</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#4A4458;">${t.discount}</td>
                  <td align="right" style="padding:8px 0;font-size:14px;color:${BRAND.primary};">-$@descuento</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#4A4458;">${t.tax}</td>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#2D2640;">$@impuesto</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:12px;border-top:2px solid ${BRAND.border};"></td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:18px;font-weight:700;color:${BRAND.dark};">${t.totalDue}</td>
                  <td align="right" style="padding:12px 0 0;font-size:22px;font-weight:800;color:${BRAND.accent};">$@total</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 16px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
                ${t.footerOrders}
                <a href="@site_url/account/order-history" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">${t.myOrders}</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#9B93A8;line-height:1.5;">
                © 2026 All in One · Ecuador<br>
                ${t.footerAuto}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOrderPaymentEmail({
	locale = 'sp',
	payUrl,
	siteUrl,
	logoUrl,
	customerName,
	orderNumber,
	date,
	itemsHtml,
	itemCount,
	subtotal,
	tax,
	discount,
	total,
}) {
	const lang = normalizeLocale(locale);
	const t = COPY[lang];

	return buildHtmlBody(locale)
		.replace(/@url_payphone/g, payUrl)
		.replace('@logo_url', logoUrl)
		.replace('@site_url', siteUrl)
		.replace('@nombre_cliente', customerName)
		.replace('@numeroorden', orderNumber)
		.replace('@fecha', date)
		.replace('@detalle', itemsHtml)
		.replace('@subtotal_label', t.subtotal(itemCount))
		.replace('@subtotal', subtotal)
		.replace('@impuesto', tax)
		.replace('@descuento', discount)
		.replace('@total', total);
}

function buildOrderPaymentEmailSubject(locale, orderNumber) {
	const lang = normalizeLocale(locale);
	return COPY[lang].subject(orderNumber);
}

export default {
	html_body: buildHtmlBody('sp'),
	htmldetalle,
	buildOrderPaymentEmail,
	buildOrderPaymentEmailSubject,
};
