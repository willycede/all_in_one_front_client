<template>
    <v-dialog v-model="open" max-width="550">
      <v-card class="py-6 px-2">
        <div class="text-center mb-6 mt-4">
          <v-progress-circular
            indeterminate
            :size="70"
            :width="7"
            color="primary"
          ></v-progress-circular>
        </div>
        <h4 class="text-center mb-6">{{ message }}</h4>
      </v-card>
    </v-dialog>
  </template>
  
  
  <script>
  export default {
    props: ["message"],
    data() {
      return {
        open: false,
      };
    },
    methods: {
      openDialog() {
        this.open = true;
      },
      close() {
        this.open = false;
      },
    },
  };
  </script>    