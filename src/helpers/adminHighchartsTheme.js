export const AIO_CHART_COLORS = ['#A96DFA', '#CA1DFF', '#8B5CF6', '#C084FC', '#E879F9', '#6366F1'];

export function formatWeekLabel(weekKey) {
	const key = String(weekKey || '');
	if (key.length >= 6) {
		const year = key.slice(0, 4);
		const week = parseInt(key.slice(4), 10);
		return `S${week} · ${year}`;
	}
	return key || '—';
}

export function formatCurrency(value) {
	const amount = parseFloat(value) || 0;
	return amount.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildBaseChartOptions(overrides = {}) {
	return {
		chart: {
			backgroundColor: 'transparent',
			style: { fontFamily: 'Roboto, system-ui, sans-serif' },
			spacing: [12, 12, 16, 12],
		},
		title: { text: null },
		credits: { enabled: false },
		colors: AIO_CHART_COLORS,
		legend: {
			align: 'center',
			verticalAlign: 'bottom',
			itemStyle: { color: '#6b7280', fontWeight: '500', fontSize: '12px' },
			itemHoverStyle: { color: '#374151' },
		},
		tooltip: {
			backgroundColor: '#ffffff',
			borderColor: 'rgba(169, 109, 250, 0.22)',
			borderRadius: 10,
			shadow: {
				color: 'rgba(15, 15, 20, 0.08)',
				offsetX: 0,
				offsetY: 4,
				width: 12,
			},
			style: { color: '#374151', fontSize: '13px' },
		},
		...overrides,
	};
}
