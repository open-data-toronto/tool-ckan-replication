<template>
  <sui-form-field required v-bind:class="{ error: error }">
    <label>CKAN Instance</label>
    <sui-dropdown
      placeholder="CKAN Instance"
      selection
      :options="instances"
      v-model="value"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormInstance',
  props: {
    error: Boolean
  },
  watch: {
    value: function (value) {
      this.$emit('change', value, 'remote', 'url')
    }
  },
  data () {
    return {
      value: 'https://ckanadmin.intra.prod-toronto.ca',
      instances: [
        { text: 'Development', value: 'https://ckanadmin0.intra.dev-toronto.ca' },
        { text: 'Staging', value: 'https://ckanadmin0.intra.qa-toronto.ca' },
        { text: 'Production', value: 'https://ckanadmin.intra.prod-toronto.ca' }
      ]
    }
  }
}
</script>
