<template>
	<div class="aio-map">
		<div v-if="!mapsReady" class="aio-map__loading" aria-hidden="true">
			<span class="aio-map__loading-ring"></span>
		</div>
		<gmap-map
			v-else
			:center="center"
			:zoom="zoom"
			style="width:100%; height: 400px;"
		>
			<gmap-marker
				v-for="(m, index) in markers"
				:key="index"
				:position="m.position"
				:clickable="true"
				:draggable="false"
			>
			</gmap-marker>
		</gmap-map>
	</div>
</template>

<script>
import { ensureGoogleMaps } from 'Helpers/loadGoogleMaps';

const DEFAULT_CENTER = { lat: -0.180653, lng: -78.467838 };

export default {
	name: 'GoogleMap',
	props: {
		mapCenter: {
			type: Object,
			default: null,
		},
		mapZoom: {
			type: Number,
			default: 12,
		},
	},
	data() {
		return {
			mapsReady: false,
		};
	},
	computed: {
		center() {
			return this.mapCenter || DEFAULT_CENTER;
		},
		zoom() {
			return this.mapZoom || 12;
		},
		markers() {
			return [{ position: this.center }];
		},
	},
	async mounted() {
		try {
			await ensureGoogleMaps();
			this.mapsReady = true;
		} catch (_) {
			this.mapsReady = false;
		}
	},
};
</script>

<style scoped>
.aio-map {
	position: relative;
	min-height: 400px;
}

.aio-map__loading {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 400px;
	background: linear-gradient(160deg, #faf8ff 0%, #f3eefb 100%);
}

.aio-map__loading-ring {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: 3px solid rgba(169, 109, 250, 0.15);
	border-top-color: #A96DFA;
	border-right-color: #CA1DFF;
	animation: aio-map-spin 0.9s linear infinite;
}

@keyframes aio-map-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
