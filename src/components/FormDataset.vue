<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>Package URL</label>
    <sui-input
      placeholder="https://ckanadmin.prod-toronto.ca/dataset/hello-world"
      icon="linkify"
      iconPosition="left"
      v-model="value"
      v-on:change="update"/>
    <ErrorMessage title="Invalid URL" message="eg. https://ckanadmin.prod-toronto.ca/dataset/bodysafe" v-bind:show="error"/>
  </sui-form-field>
</template>

<script>
import ErrorMessage from '@/components/ErrorMessage.vue'

export default {
  name: 'FormDataset',
  components: {
    ErrorMessage
  },
  methods: {
    update: function (event) {
      let value = event.target.value

      try {
        value = new URL(value)
        this.error = false
      } catch {
        this.error = true
      }

      this.$emit('set-dataset', value)
    }
  },
  data () {
    return {
      error: false,
      value: ''
    }
  }
}
</script>
