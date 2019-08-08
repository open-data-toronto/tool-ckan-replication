<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>{{ title }}</label>
    <sui-dropdown
      selection
      :options="options"
      v-model="value"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormDropdown',
  props: {
    title: String,
    options: Array,
    error: Boolean
  },
  watch: {
    value: function (value) {
      this.$emit('change', value, 'to', 'address')
    }
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
