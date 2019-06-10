<template>
  <div is="sui-container">
    <sui-form v-on:submit.prevent="loadPackage">
      <sui-grid divided="vertically">
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Source</sui-header>
              <sui-segment attached="bottom">
                <FormDataset @set-dataset="setDataset"/>
                <FormAPIKey type="dataset" @set-apikey="setAPIKey"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Target</sui-header>
              <sui-segment attached="bottom">
                <FormInstance @set-instance="setInstance"/>
                <FormAPIKey type="instance" @set-apikey="setAPIKey"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
      </sui-grid>
      <sui-button basic
        type="submit"
        content="Next"
        icon="right arrow"
        label-position="right"/>
    </sui-form>
  </div>
</template>

<script>
import FormAPIKey from '@/components/FormAPIKey.vue'
import FormDataset from '@/components/FormDataset.vue'
import FormInstance from '@/components/FormInstance.vue'

const axios = require('axios')

export default {
  name: 'TheForm',
  components: {
    FormAPIKey,
    FormDataset,
    FormInstance
  },
  methods: {
    loadPackage: function () {
      this.validateEnvs()

      // TODO: assert if no errors and no missing

      const link = this.dataset.url.origin + '/api/3/action/package_show?id=' + this.dataset.url.pathname.split('/')[2]
      axios
        .get(link)
        .then(response => {
            this.data = response.data.result
          }
        )
    },
    setAPIKey: function (val, inst) {
      this[inst].key = val
    },
    setDataset: function (val) {
      this.dataset.url = val
    },
    setInstance: function (val) {
      this.instance.url = val
    },
    validate: function () {
      this.error = true
      // duplicate = this.dataset.url && this.instance.url && this.dataset.url.host === this.instance.url.host
    }
  },
  data () {
    return {
      data: null,
      error: false,
      dataset: {
        url: '',
        key: ''
      },
      instance: {
        url: new URL('https://ckanadmin.prod-toronto.ca'),
        key: ''
      }
    }
  }
}
</script>
