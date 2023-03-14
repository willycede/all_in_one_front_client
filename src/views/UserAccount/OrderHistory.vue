<template>
   <div class="order-history-wrap emb-card pa-4">
      <h4 class="mb-4">Historial</h4>
      <v-data-table 
         :headers="headers"
			:items="tableData"
			hide-default-footer
      >
         <template v-for="header in headers.filter((header) => header.hasOwnProperty('formatter'))" v-slot:[`item.${header.value}`]="{ header, value }">
            {{ header.formatter(value) }}
         </template>
         <template v-slot:item.action="{ item }">
            <a @click="greet(item)"><v-icon class="accent--text">payment</v-icon></a>
				<a @click="greet(item)"><v-icon class="accent--text">payment</v-icon></a>
			</template>
      </v-data-table>
   </div>
</template>

<script>

import api from "Api";
import moment from "moment";

export default {
   data(){
      return{
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
               text: 'Estado', 
               value: 'status',  
               formatter: this.formatEstatus   
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

      console.log(localStorage.id_users);


      const shopCart = await api.get(
      "/api/order_history/get_order_history/" + localStorage.id_users
      );

      this.tableData = shopCart.data.data




   }, computed:{

      

   },methods: 
   {

      greet(item){
         console.log(item.url_payphone);
         window.open(item.url_payphone, '_blank');
      },

      formatCurrency (value) {
         console.log(value);
         return "$ " + parseFloat(value).toFixed(2);
      },

      formatEstatus (value) {
         console.log(value);
         return(value === 2) ? "PENDIENTE" : "PAGADO";
      }
   }
}
</script>

