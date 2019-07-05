<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>{{ title }}</label>
    <sui-input
      :placeholder="placeholder"
      :icon="icon"
      iconPosition="left"
      v-model="value"
      @change="$emit('change', $event.target.value, 'local', 'url')"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    title: String,
    placeholder: String,
    icon: String,
    error: Boolean
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
