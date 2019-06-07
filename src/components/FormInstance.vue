<template>
  <sui-form-field required>
    <label>CKAN Instance</label>
    <sui-dropdown button labeled
      class="icon"
      icon="linkify"
      :options="instances"
      :value="instance"
      @input="$emit('set-instance', $event)"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormInstance',
  props: {
    'instance': String
  },
  data () {
    return {
      instances: [
        { text: 'Development', value: 'https://ckanadmin0.intra.dev-toronto.ca' },
        { text: 'Staging', value: 'https://ckanadmin0.intra.qa-toronto.ca' },
        { text: 'Production', value: 'https://ckanadmin.intra.prod-toronto.ca' }
      ]
    }
  }
}
</script>
