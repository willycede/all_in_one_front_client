<template>
   <div class="order-history-wrap emb-card pa-4">
      <h4 class="mb-4">Historial</h4>
      <div class="layout justify-end mt-0 mb-4 mx-0">
         <div class="alert alert-info" role="alert">
            En el caso de que despues de haber realizado su pago no se ha procesado de forma automatica su factura, por favor dar clic sobre el boton
            <a><v-icon class="accent--text">published_with_changes</v-icon></a> Reprocesar
         </div>
      </div>
      <v-data-table :headers="headers" :items="tableData" hide-default-footer>
         <template v-for="header in headers.filter((header) => header.hasOwnProperty('formatter'))"
            v-slot:[`item.${header.value}`]="{ header, value }">
            {{ header.formatter(value) }}
         </template>
         <template v-slot:item.action="{ item }">
            <div class="text-alient-center">
               <a title="Link de Pago" v-if="item.status == 2  " @click="greet(item)"><v-icon class="accent--text">payment</v-icon></a>
               <a title="Cancelar Orden" v-if="item.status == 2 " @click="deletHistory(item)"><v-icon class="accent--text">cancel</v-icon></a>
               <a title="Procesar Factura" v-if="item.status === 3 &&  item.status_invoice === 0 " @click="deletHistory(item)"><v-icon class="accent--text">published_with_changes</v-icon></a>
            </div>
            
         </template>
      </v-data-table>
   </div>
</template>

<script>
import api from "Api";
import moment from "moment";
export default {
   data() {
      return {
         dateFormat: "DD/MM/YYYY",
         headers: [
            { text: 'N Orden', value: 'id_shopping_car' },
            {
               text: 'Fecha Registro',
               value: 'created_at',
               formatter: (x) => (x ? moment(x).format(this.dateFormat) : null),
            },
            {
               text: 'Total',
               value: 'shopping_car_total',
               align: 'right',
               formatter: this.formatCurrency
            },
            {
               text: 'Estado Pedido',
               value: 'status',
               formatter: this.formatEstatus
            },
            {
               text: 'Estado Factura',
               value: 'status_invoice',
               formatter: this.formatFacturado
            },
            {
               text: 'Opciones',
               value: 'action'
            }
         ],
         tableData: []
      }
   },
   async mounted() {

      //console.log(localStorage.id_users);


      const shopCart = await api.get(
         "/api/order_history/get_order_history/" + localStorage.id_users
      );
      //console.log(shopCart.data.data);
      this.tableData = shopCart.data.data




   }, computed: {



   }, methods:
   {

      greet(item) {
         //console.log(item.url_payphone);
         window.open(item.url_payphone, '_blank');
      },

      formatCurrency(value) {
         //console.log(value);
         return "$ " + parseFloat(value).toFixed(2);
      },

      formatEstatus(value) {
         return (value === 2) ? "IN-PAGO" : ((value === 4) ? "CANCELADO" :  "PAGADO");
      },
      formatFacturado(value) {
         return (value === 0) ? "-" : "FACTURADO";
      },
      async deletHistory(item) {
         //console.log(item);
         //window.open(item.url_payphone, '_blank');

         const HistoryDetails = await api.get(
            "/api/order_history/delete_order_history/" + item.id_shopping_car +"/"+ localStorage.id_users
         );

        // console.log(HistoryDetails.data.data);

         this.tableData = HistoryDetails.data.data
      }
   }
}
</script>