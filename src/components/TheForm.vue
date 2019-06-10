<template>
  <div is="sui-container">
    <sui-form>
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
        <sui-grid-row centered>
          <ModalDataset v-bind:data="data" v-bind:open="viewing" @toggle="toggle" @submit="replicate"/>
        </sui-grid-row>
      </sui-grid>
    </sui-form>
  </div>
</template>

<script>
import FormAPIKey from '@/components/FormAPIKey.vue'
import FormDataset from '@/components/FormDataset.vue'
import FormInstance from '@/components/FormInstance.vue'

import ModalDataset from '@/components/ModalDataset.vue'

const axios = require('axios')

export default {
  name: 'TheForm',
  components: {
    FormAPIKey,
    FormDataset,
    FormInstance,
    ModalDataset
  },
  methods: {
    load: function () {
      // TODO: assert if urls are URL and no missing
      this.validate()

      axios.get(
        this.dataset.url.origin + '/api/3/action/package_show?id=' + this.dataset.url.pathname.split('/')[2]
      ).then(
        response => {
          this.data = response.data.result
        }
      )
    },
    replicate: function () {

    },
    // TODO: merge set functions
    setAPIKey: function (val, inst) {
      this[inst].key = val
    },
    setDataset: function (val) {
      this.dataset.url = val
    },
    setInstance: function (val) {
      this.instance.url = val
    },
    toggle: function () {
      if (!this.viewing) { // before show - always load the dataset (ie. changes to the dataset input not tracked)
        // TODO: spin wheel while loading on the button before showing modal
        this.load()
      }

      this.viewing = !this.viewing
    },
    validate: function () {
      this.error = true
      // duplicate = this.dataset.url && this.instance.url && this.dataset.url.host === this.instance.url.host
    }
  },
  data () {
    return {
      // Package data
      data: null,
      // Track state
      failing: false,
      viewing: false,
      // Form inputs
      dataset: {
        url: '',
        key: ''
      },
      instance: {
        url: new URL('https://ckanadmin.prod-toronto.ca'),
        key: ''
      },
    }
  }
}
</script>
