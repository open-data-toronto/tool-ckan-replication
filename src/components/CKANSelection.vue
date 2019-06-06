<template>
  <sui-grid-column>
    <sui-segment basic>
      <sui-header attached="top" textAlign="center">{{ type | capitalize }}</sui-header>
      <sui-segment attached="bottom">
        <sui-form-field required  v-if="type=='Source'">
          <label>Package URL</label>
          <sui-input placeholder="https://open.toronto.ca/dataset/hello-world" icon="linkify" iconPosition="left"/>
        </sui-form-field>
        <sui-form-field required  v-if="type=='Target'">
          <label>Environment</label>
          <sui-dropdown button class="icon" icon="linkify" labeled :options="environments" v-model="current"/>
        </sui-form-field>
        <sui-form-field required>
          <label>Password</label>
          <sui-input type="password" icon="lock" iconPosition="left"/>
        </sui-form-field>
      </sui-segment>
    </sui-segment>
  </sui-grid-column>
</template>

<script>
export default {
  name: 'CKANSelection',
  props: {
    type: String
  },
  filters: {
    capitalize: function (value) {
      if (!value) {
        return ''
      }

      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  data () {
    return {
      current: 'prod',
      environments: [
        { key: 'dev', text: 'Development', value: 'dev' },
        { key: 'qa', text: 'Staging', value: 'qa' },
        { key: 'prod', text: 'Production', value: 'prod' }
      ]
    }
  }
}
</script>
