<template>
  <sui-form-field required v-bind:class="{ error: hasError }">
    <label>Package URL</label>
    <sui-input
      placeholder="https://ckanadmin.prod-toronto.ca/dataset/hello-world"
      icon="linkify"
      iconPosition="left"
      @input="setDataset"/>
    <sui-message v-show="hasError">
      <sui-message-header>Package URL</sui-message-header>
      <p>The URL should be similar to https://ckanadmin.prod-toronto.ca/dataset/[dataset-name]</p>
    </sui-message>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormDataset',
  methods: {
    setDataset (url) {
      this.hasError = !url.startsWith('https://ckanadmin') || url.indexOf('toronto.ca/dataset') === -1
    }
  },
  data () {
    return {
      hasError: false
    }
  }
}
</script>
