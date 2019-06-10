<template>
  <sui-form-field required>
    <label>Password</label>
    <sui-input
      type="password"
      icon="lock"
      iconPosition="left"
      @change="$emit('set-apikey', $event.target.value, type)"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormAPIKey',
  props: {
    type: String
  }
}
</script>
