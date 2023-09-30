<template>
	<div class="emb-signIn-wrap section-gap">
		<div class="container py-0">
			<v-layout row wrap align-center justify-center>
				<v-flex sm12 md12 lg8 xl7>
					<v-layout row mx-sm-0 mx-3 wrap align-center justify-center>
						<v-flex sm6 md7 lg6 xl6 hidden-sm-and-down>
							<div class="form-img sign-in-image"></div>
						</v-flex>
						<v-flex sm10 md5 lg5 xl6>
							<div class="emb-card sign-in-form form-margin d-block white pa-6">
								<h4>Inicio de sesión</h4>
								<v-form ref="form" v-model="valid">
									<v-text-field
										type="email"
										placeholder="Email*"
                                        v-model="form.email"
                                        :rules="emailRules"
									>
									</v-text-field>
									<v-text-field
										type="password"
										placeholder="Contraseña*"
                                        v-model="form.password"
                                        :rules="passwordRules"
									>
									</v-text-field>
									<v-btn class="accent mb-3 ma-0 mr-4" largE @click="saveDetails">
										Ingresar
									</v-btn>
                                    <v-btn class="white mb-3 ma-0" largE @click="openModalrecoverPassword">
										Recuperar clave
									</v-btn>
									<p>No tienes una cuenta? <router-link to="/client/register" class="accent--text">Da click para registrarte</router-link></p>
								</v-form>
							</div>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
        <v-dialog v-model="open" max-width="550">
            <v-card class="py-6 px-2">
                <h4 class=" text-center mb-6">Ingresa tu email para recuperar tu clave</h4>
                <v-form ref="formRecovery" v-model="validRecovery">
                    <v-text-field
                        type="email"
                        placeholder="Email*"
                        v-model="formRecovery.email"
                        :rules="emailRules"
                    />
                </v-form>
                
                <v-card-actions class="layout justify-center">
                    <v-btn color="accent mx-2" @click="recoverPassword">Recuperar clave</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
   </div>
</template>
<script>
    import api from 'Api';
	export default{
		data(){
			return{
                open: false,
                valid: false,
                validRecovery: false,
                formRecovery: {
                    email: '',
                },
                form: {
                    email: '',
                    password: '',
                    
                },
                emailRules: [
					v => !!v || 'El email es requerido',
					v => /.+@.+/.test(v) || 'El email ingresado es incorrecto'
                ],
                passwordRules: [
                    v => !!v || 'La contraseña es requerida',
                    v => !(v?.length < 8) || 'La contraseña debe tener más de 8 caracteres',
                ],
			}
		},
        methods: {
            recoverPassword(){
                this.$refs.formRecovery.validate();
                console.log(this.$refs.formRecovery.validate())
				if(this.validRecovery){
                    api.post('/api/users/resetPassword', this.formRecovery)
                    .then(() => {
                        this.$snotify.success('Clave recuperada con éxito, revise su correo porfavor',{
                            closeOnClick: false,
                            pauseOnHover: false,
                            timeout: 2000,
                            showProgressBar:false,
                        });
                    }).catch((err) => {
                        let defaultErrorMessage = err?.response?.data?.error?.message ? err?.response?.data?.error?.message :  'Ocurrio un error inesperado'; 
                        if (Object.keys(err?.response?.data?.error?.validationObject).length > 0) {
                            this.$snotify.error(err.response.data.error.validationObject.email, {
                                closeOnClick: false,
                                pauseOnHover: false,
                                timeout: 2000,
                                showProgressBar:false,
                            });
                            this.$snotify.error(err.response.data.error.validationObject.password, {
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
            },
            openModalrecoverPassword(){
                this.open = true;
            },
            saveDetails(){
				this.$refs.form.validate();
                console.log(this.$refs.form.validate())
				if(this.valid){
					api.post('/api/users/login', this.form)
                    .then((res) => {
                        this.$snotify.success('Bienvenidoo',{
                            closeOnClick: false,
                            pauseOnHover: false,
                            timeout: 2000,
                            showProgressBar:false,
                        });
                        localStorage.email = res.data.data.email;
                        localStorage.id_users = res.data.data.id_users;
                        localStorage.identification_number = res.data.data.identification_number;
                        localStorage.name_user = res.data.data.name_user;
                        localStorage.last_name_user = res.data.data.last_name_user;
                        localStorage.id_user_rol = res.data.data.id_user_rol;
                        localStorage.id_rol = res.data.data.id_rol;
                        localStorage.id_company_user = res.data.data.id_company_user;
                        localStorage.access_token = res.data.data.access_token;
                        this.$router.push({ path: '/mainPage' });
                        // this.$router.go('/mainPage');
                    }).catch((err) => {
                        let defaultErrorMessage = err?.response?.data?.error?.message ? err?.response?.data?.error?.message :  'Ocurrio un error inesperado'; 
                        if (Object.keys(err?.response?.data?.error?.validationObject).length > 0) {
                            this.$snotify.error(err.response.data.error.validationObject.email, {
                                closeOnClick: false,
                                pauseOnHover: false,
                                timeout: 2000,
                                showProgressBar:false,
                            });
                            this.$snotify.error(err.response.data.error.validationObject.password, {
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
