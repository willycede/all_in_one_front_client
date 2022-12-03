<template>
	<div class="emb-register-wrap section-gap">
		<div class="container py-0">
			<v-layout row wrap align-center justify-center>
				<v-flex sm12 md12 lg8 xl7>
					<v-layout row mx-sm-0 mx-3  wrap align-center justify-center>
						<v-flex sm6 md7 lg6 xl6 hidden-sm-and-down>
							<div class="form-img register-image"></div>
						</v-flex>
						<v-flex sm10 md5 lg6 xl6>
							<div class="emb-card sign-in-form form-margin d-block white pa-6">
								<h4>Ingresa tus datos para conocer all in one</h4>
								<v-form ref="form" v-model="valid">
                                     <v-flex class="d-flex justify-space-between"  sm12 md12 lg12 x16>
                                        <v-text-field
                                            type="text"
                                            placeholder="Nombres*"
                                            :rules="inputRules.basictextRules"
                                            v-model="formData.name_user"
                                        >
                                        </v-text-field>
                                        <v-text-field
                                            type="text"
                                            placeholder="Apellidos*"
                                            :rules="inputRules.basictextRules"
                                            class="ml-5"
                                            v-model="formData.last_name_user"
                                        >
                                        </v-text-field>
                                    </v-flex>
									
                                    <v-text-field
										type="text"
										placeholder="Cedula*"
										:rules="identificationNumberRul"
                                        v-model="formData.identification_number"
									>
									</v-text-field>
									<v-text-field
										type="email"
										placeholder="Email*"
										:rules="emailRules"
                                        v-model="formData.email"
									>
									</v-text-field>
									<v-text-field
										type="password"
										placeholder="Contraseña*"
										:rules="passwordRules"
                                        v-model="formData.password"
									>
									</v-text-field>
									<v-text-field
										class="mb-4"
										type="password"
										placeholder="Confirmar contraseña*"
										:rules="confirmationPasswordRules"
									>
									</v-text-field>
									<v-btn class="accent mx-0 mb-4" large  @click.stop.prevent="saveDetails">
										Registrarse
									</v-btn>
									<p>Posees una cuenta? entonces<router-link to="/client/login" class="accent--text"> Inicia Sesión</router-link></p>
								</v-form>
							</div>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
   </div>
</template>
	
<script>
    import api from 'Api';
	export default{
   	data () {
      	return {
         	valid: false,
            formData: {
                name_user: '',
                last_name_user: '',
                identification_number: '',
                email: '',
                password: '',
            },
            validationObject: {
                identification_number: '',
            },
			emailRules: [
					v => !!v || 'El email es requerido',
					v => /.+@.+/.test(v) || 'El email ingresado es incorrecto'
      		],
            passwordRules: [
                v => !!v || 'La contraseña es requerida',
                v => !(v?.length < 8) || 'La contraseña debe tener más de 8 caracteres',
            ],
            confirmationPasswordRules: [
                v => !!v || 'La contraseña es requerida',
                v =>  this.formData.password === v  || 'La confirmación de contraseña debe coincidir con la previamente ingresada',
            ],
          	inputRules: {
               basictextRules: [v => !!v || `El campo es requerido`]
            },
            identificationNumberRul:  [
                v => !!v || 'El número de identificación es requerida',
                v =>  (v?.length ===10 || v?.length ===13)  || 'El número de identificación debe tener 10 caracteres o 13',
            ]    
         }
      },
      methods: {
         saveDetails(){
				this.$refs.form.validate();
				if(this.valid){
					api.post('/api/users/register', this.formData)
                    .then(() => {
                        this.$snotify.success('Registro éxitoso',{
                            closeOnClick: false,
                            pauseOnHover: false,
                            timeout: 2000,
                            showProgressBar:false,
                        });
                        setTimeout(() => {
                            this.$router.push({ path: '/client/login' });
                        }, 300);
                    }).catch((err) => {
                          console.log("errr", err)
                        let defaultErrorMessage = err?.response?.data?.error?.message ? err?.response?.data?.error?.message :  'Ocurrio un error inesperado'; 
                        if (Object.keys(err?.response?.data?.error?.validationObject).length > 0) {
                            this.$snotify.error(err.response.data.error.validationObject.identification_number, {
                                closeOnClick: false,
                                pauseOnHover: false,
                                timeout: 2000,
                                showProgressBar:false,
                            });
                            return;
                        }
                         this.$snotify.error(defaultErrorMessage,{
                            closeOnClick: false,
                            pauseOnHover: false,
                            timeout: 2000,
                            showProgressBar:false,
                        });
                    });
                }	
			}
		}
	}
</script>