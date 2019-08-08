<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>{{ title }}</label>
    <sui-input
      type="password"
      icon="lock"
      iconPosition="left"
      v-model="value"
      @change="$emit('change', $event.target.value, name, 'apikey')"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormAPIKey',
  props: {
    title: String,
    name: String,
    error: Boolean
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
