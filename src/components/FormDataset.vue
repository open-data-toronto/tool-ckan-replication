<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>Package URL</label>
    <sui-input
      placeholder="https://ckanadmin.prod-toronto.ca/dataset/hello-world"
      icon="linkify"
      iconPosition="left"
      v-model="value"
      v-on:change="update"/>
    <sui-message negative v-show="error">
      <sui-message-header>Invalid URL</sui-message-header>
      <p>eg. <i>https://ckanadmin.prod-toronto.ca/dataset/bodysafe</i></p>
    </sui-message>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormDataset',
  methods: {
    update: function (event) {
      try {
        this.error = false

        this.$emit('set-dataset', new URL(event.target.value))
      } catch {
        this.error = true
      }
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
