<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>API Key</label>
    <sui-input
      type="password"
      icon="lock"
      iconPosition="left"
      v-model="value"
      @change="$emit('change', $event.target.value, location, 'key')"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormAPIKey',
  props: {
    location: String,
    error: Boolean
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
