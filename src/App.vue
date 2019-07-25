<template>
  <div class="home">
    <TheNavbar/>
    <TheReplicator/>
  </div>
</template>

<script>
// @ is an alias to /src
import TheNavbar from '@/components/TheNavbar.vue'
import TheReplicator from '@/components/TheReplicator.vue'

export default {
  name: 'Home',
  components: {
    TheNavbar,
    TheReplicator
  }
}
</script>
