<template>
  <div class="home">
    <Navbar/>
    <Form/>
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from '@/components/Navbar.vue'
import Form from '@/components/Form.vue'

const axios = require('axios')

export default {
  name: 'home',
  components: {
    Navbar,
    Form
  }
}
</script>
