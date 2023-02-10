<template>
   <div class="editInfo-wrap emb-card pa-4">
      <div class="">
         <h4>Editar Información de la cuenta</h4>
         <v-form ref="form" v-model="valid" class="mb-2">
            <v-layout row wrap>
               <v-flex xs12 sm12 md12 lg12 x12>
                  <v-layout row wrap>
                     <v-flex xs12 sm12 md12 lg12 xl12 py-1>
                        <v-text-field label="Email" :rules="emailRules" v-model="email"></v-text-field>
                     </v-flex>
                     <v-flex xs12 sm12 md12 lg12 xl12 pt-1 pb-0>
                        <v-btn class="accent mx-0 mb-4" @click.stop.prevent="edit">Editar</v-btn>
                     </v-flex>
                  </v-layout>
               </v-flex>
               
            </v-layout>
         </v-form>
      </div>
   </div>
</template>

<script>
   import api from 'Api';
	export default{
   	data () {
      	return {
				val: '',
         	valid: false,
				emailRules: [
               v => !!v || 'El email es requerido',
               v => /.+@.+/.test(v) || 'El email debe ser valido'
            ],
            email: '',
         }
      },
      methods: {
        async edit(){
            try {
               this.$refs.form.validate();
               if(this.valid == true){
                  const response = await api.post(`/api/users/update`, {
                     email: this.email,
                     id_users: localStorage.id_users
                  });
                  console.log(response)
                  localStorage.setItem('email', response.data.data.email);
                  this.$snotify.success('Información actualizada con exíto',{
                     closeOnClick: false,
                     pauseOnHover: false,
                     timeout: 1000,
                     showProgressBar:false,
                  });
                  setTimeout(() => {
                     this.$router.push({ path: '/account/profile' });
                  }, 50);
               }
            } catch (error) {
               this.$snotify.error('Ocurrio un error inesperado',{
                  closeOnClick: false,
                  pauseOnHover: false,
                  timeout: 1000,
                  showProgressBar:false,
               });
            }
				
         },
      }
   }
</script>