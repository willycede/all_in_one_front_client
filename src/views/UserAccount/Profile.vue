<template>
   <div class="profile-wrapper emb-card pa-4">
      <h4>Información del usuario</h4>
      <div class="pt-4">
         <div class="proflie-field mb-4" v-for="(info,key) in profileData" :key="key">
            <label>{{info.key}} :</label>
            <span>{{info.value}}</span>
         </div>
         <router-link :to="{name: 'EditProfileInfo', query: {type: 'info'}}" > <v-btn class="accent mx-0">Editar</v-btn> </router-link>
      </div>
   </div>
</template>

<script>
import api from 'Api';
export default {
   data(){
      return{
         profileData:[]
      }
   },
   async mounted(){
		await this.populateUserInfo()
	},
   methods: {
      async populateUserInfo() {
         const response = await api.get(`/api/users/${localStorage.id_users}`);
         if (response && response.data && response.data.data) {
            const user = response.data.data;
            this.profileData.push(
               {
                  key:"Nombres",
                  value: user.name_user,
               },
               {
                  key:"Apellidos",
                  value: user.last_name_user
               },
               {
                  key:"Email",
                  value: user.email
               },
               {
                  key: "Cedula/Ruc",
                  value: user.identification_number
               },
               {
                  key: "Dirección",
                  value: user.address
               },
            );
         }
         
      }
   }
}
</script>