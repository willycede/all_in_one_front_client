<template>
	<div class="cart-content section-gap">
        <v-container grid-list-xl py-0>
            <div class="text-center">
                <div class="text-center">
                    <div class="mb-6">
                    <img
                        alt="cart-empty"
                        height="400"
                        src="/static/images/payphone.png"
                        width="400"
                    />
                    </div>
                    <h4>Verificando Link de Pago</h4>
                    <p class="primary--text">Redireccionando, por favor espere....</p
                    >
                </div>
            </div>
        </v-container>
	</div>
</template>

<script>


export default {
	computed: {

        

        
		
	},
	async mounted() {


        
        if(this.$route.query?.urlPago) {
            this.urlPago = this.$route.query.urlPago;
        }

        setTimeout(() => {
            location.href = this.urlPago
        }, 3000);

        

	
	},
	watch: {
       
    },
	data () {
		
	},
	methods: {

		
	}
}
</script>
