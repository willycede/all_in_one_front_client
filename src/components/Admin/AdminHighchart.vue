<template>
	<div ref="container" class="aio-admin-chart" :style="{ height }"></div>
</template>

<script>
import Highcharts from 'highcharts';
import { buildBaseChartOptions } from '@/helpers/adminHighchartsTheme';

export default {
	name: 'AdminHighchart',
	props: {
		options: {
			type: Object,
			default: null,
		},
		height: {
			type: String,
			default: '320px',
		},
	},
	data() {
		return {
			chart: null,
			resizeObserver: null,
		};
	},
	watch: {
		options: {
			deep: true,
			handler() {
				this.renderChart();
			},
		},
	},
	mounted() {
		this.renderChart();
		if (typeof ResizeObserver !== 'undefined' && this.$refs.container) {
			this.resizeObserver = new ResizeObserver(() => {
				if (this.chart) {
					this.chart.reflow();
				}
			});
			this.resizeObserver.observe(this.$refs.container);
		}
	},
	beforeDestroy() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}
	},
	methods: {
		renderChart() {
			if (!this.$refs.container || !this.options) {
				return;
			}

			const mergedOptions = buildBaseChartOptions(this.options);

			if (this.chart) {
				this.chart.update(mergedOptions, true, true);
				return;
			}

			this.chart = Highcharts.chart(this.$refs.container, mergedOptions);
		},
	},
};
</script>
