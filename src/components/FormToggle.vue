<template>
  <sui-form-field>
    <label>
      {{ title }}
    </label>
    <sui-checkbox
      toggle
      v-model="value"
      @change="$emit('change', value, 'state', name)"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormToggle',
  props: {
    title: String,
    name: String,
    default: Boolean
  },
  data () {
    return {
      value: this.default
    }
  }
}
</script>
