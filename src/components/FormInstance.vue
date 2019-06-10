<template>
  <sui-form-field required>
    <label>CKAN Instance</label>
    <sui-dropdown button labeled
      class="icon"
      type="button"
      icon="linkify"
      :options="instances"
      v-model="value"
      @change="$emit('set-instance', new URL($event.target.value))"/>
  </sui-form-field>
</template>

<script>
export default {
  name: 'FormInstance',
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
