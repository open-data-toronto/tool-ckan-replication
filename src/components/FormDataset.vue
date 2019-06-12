<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>Package URL</label>
    <sui-input
      placeholder="https://ckanadmin.prod-toronto.ca/dataset/hello-world"
      icon="linkify"
      iconPosition="left"
      v-model="value"
      @change="$emit('change', $event.target.value, 'local', 'url')"/>
  </sui-form-field>
</template>

<script>
import ErrorMessage from '@/components/ErrorMessage.vue'

export default {
  name: 'FormDataset',
  props: {
    error: Boolean
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
