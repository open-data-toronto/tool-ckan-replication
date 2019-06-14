<template>
  <sui-form-field required>
    <label>API Key</label>
    <sui-input
      type="password"
      icon="lock"
      iconPosition="left"
      @change="$emit('change', $event.target.value, location, 'key')"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormAPIKey',
  props: {
    location: String
  }
}
</script>
