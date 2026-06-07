<template>
	<div>
		<gmap-map
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
};
</script>
