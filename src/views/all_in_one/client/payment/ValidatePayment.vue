<template>
	<div class="cart-content section-gap">
        <v-container grid-list-xl py-0>
            <div class="text-center">
                <div v-if="cobro"  class="text-center">
                    <div class="mb-6">
                    <img
                        alt="cart-empty"
                        height="400"
                        src="/static/images/valida_pago.gif"
                        width="400"
                    />
                    </div>
                    <h4>Verificando Pago</h4>
                    <p class="primary--text">Una vez verificado el pago se redirecionara de forma automatica, por favor espere.</p
                    >
                </div>
                <div v-if="pago_exitoso"  class="text-center">
                    <div class="mb-6">
                    <img
                        alt="cart-empty"
                        height="320"
                        src="/static/images/pago_exitoso.png"
                        width="320"
                    />
                    </div>
                    <h4>Pago confirmado</h4>
                    <p class="primary--text">El pago fue confirmado, generando factura, por favor espere.....</p
                    >
                </div>
            </div>
        </v-container>
	</div>
</template>

<script>

import api from "Api";
import HtmlElement from "Constants/HtmlMailComprobante";

export default {
	computed: {

        

        
		
	},
	async mounted() {
        
        if(this.$route.query?.clientTransactionId) {
            this.clientTransactionId = this.$route.query.clientTransactionId;
        }

        if(this.$route.query?.id) {
            this.id = this.$route.query.id;
        }

        let orden = this.clientTransactionId.split('@')[0];

        this.onConfirmaPagoPayphone(this.id,this.clientTransactionId,orden);

	
	},
	watch: {
        "$route"(to) {
            this.clientTransactionId = to.params.clientTransactionId;
            this.id = to.params.id;
        },
    },
	data () {
		return{
            cobro:true,
            pago_exitoso:false,
			id: "",
            clientTransactionId: "",
			selectedImage: null
		}
	},
	methods: {

        async onConfirmaPagoPayphone(id, clientTxId,orden) {

            try {
               
                const arr_pay_confir = {
                    id: id,
                    clientId: clientTxId,
                    orden: orden
                };
                
                /*Ejecutamos api que genera link de pago payphone */
                const urlPayphone = await api.post(
                    "/api/shoppingcar/payphone/confirm",
                    arr_pay_confir
                );

                //console.log(urlPayphone.data);
                /*validamos si el link de pago se genero correctamente */
                if (urlPayphone.data.errorCode === 200) {

                    /*confirmamos que la transaccion del pago fue exitosa */

                    setTimeout(() => {

                        this.cobro = false;
                        this.pago_exitoso = true;

                        this.onProcesarFacturacion(orden);



                    }, 3000);

                    

                /*
                let html = HtmlElement.html_body
                    .replace("@url_payphone", urlPayphone.data.url)
                    .replace("@detalle", detallefinal)
                    .replace(
                    "@fecha",
                    new Date().toLocaleDateString() +
                        " " +
                        new Date().toLocaleTimeString()
                    )
                    .replace("@numeroorden", localStorage.id_orden)
                    .replace("@totalcantidad", this.cart.length)
                    .replace("@subtotal", subtotal / 100)
                    .replace("@impuesto", impuesto / 100)
                    .replaceAll("@total", total / 100);
                    const data_send_mail = {
                    html: html,
                    email: localStorage.email,
                    };
                    await api.post(
                    "/api/shoppingcar/sendmail",
                    data_send_mail
                    );
                    //console.log(EventoSendMail);
                    this.$refs.loadComponent.close();
                    const upd_shop = {
                    url_payphone: urlPayphone.data.url,
                    status: 2,
                    id_shopping_car: localStorage.id_orden
                    };
                    this.updateShoppingPay(upd_shop).then((data) => {
                        if(data.status === 200){
                        this.$router.push('/account/order-history');
                        }else{
                        this.$snotify.error("El proceso no pudo ser gestionado", {
                            closeOnClick: false,
                            pauseOnHover: false,
                            timeout: 1000,
                        });
                        }
                    });*/
                    
                } else {
                    console.log(urlPayphone.data);
                }
            } catch (e) {
                console.log(e);
                this.$refs.loadComponent.close();
            }

        },

        async onProcesarFacturacion(orden) {


            let html = '';

            /* Procesamos la facturacion electronica */

            /*obtenemos datos de facturacion*/                        
            const response = await api.get(`/api/users/${localStorage.id_users}`);
            if (response && response.data && response.data.data) {

                const shopCart = await api.get(
                    "/api/shoppingcar/get_shop_by_id/" + localStorage.id_orden
                );

                const comprobante = shopCart.data.data;
                const user = response.data.data;

                console.log(comprobante[0].shopping_car_total);

                html = HtmlElement.html_body
                    .replace("@nombre_cliente", user.name_user +' ' +user.last_name_user)
                    .replace("@valor", comprobante[0].shopping_car_total)
                    .replace("@documento", '001-001-' +("000000000" + localStorage.id_orden).slice(-9))
                    .replace("@clave", '000000000000000000000000000000000000000000000000')
                    .replace("@fecha", 
                        new Date().toLocaleDateString() +
                        " " +
                        new Date().toLocaleTimeString()
                    )



            }

            /* actualiza estado */

            const arr_invoice = {
                orden: orden
            };

            await api.post(
                "/api/shoppingcar/payphone/invoice/state",
                arr_invoice
            );

            const data_send_mail = {
                html: html,
                email: localStorage.email,
            };

            /* genera el envio de email con el comprobante electronico */

            api.post(
            "/api/shoppingcar/sendmail",
            data_send_mail
            );

            /*Redirecionando historial */
            setTimeout(() => {
                this.$router.push('/account/order-history');
            }, 3000);


        }
		
	}
}
</script>
