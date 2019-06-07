<template>
  <div class="home">
    <TheNavbar/>
    <TheForm/>
  </div>
</template>

<script>
// @ is an alias to /src
import TheNavbar from '@/components/TheNavbar.vue'
import TheForm from '@/components/TheForm.vue'

const axios = require('axios')

export default {
  name: 'home',
  components: {
    TheNavbar,
    TheForm
  }
}
</script>
