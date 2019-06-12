<template>
  <div is="sui-container">
    <sui-form @submit.prevent="replicate">
      <sui-grid>
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Origin</sui-header>
              <sui-segment attached="bottom">
                <FormDataset :error="error.type == 'duplicate' || error.type == 'url'" @change="set"/>
                <FormAPIKey location="local" @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Destination</sui-header>
              <sui-segment attached="bottom">
                <FormInstance :error="error.type == 'duplicate'" @change="set"/>
                <FormAPIKey location="remote" @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
        <sui-grid-row centered>
          <ErrorMessage :title="error.title" v-show="error.type.length > 0"/>
        </sui-grid-row>
        <sui-grid-row centered>
          <ModalDataset :data="local" :open="state.open" @toggle="toggle"/>
        </sui-grid-row>
      </sui-grid>
    </sui-form>
  </div>
</template>

<script>
import FormAPIKey from '@/components/FormAPIKey.vue'
import FormDataset from '@/components/FormDataset.vue'
import FormInstance from '@/components/FormInstance.vue'

import ErrorMessage from '@/components/ErrorMessage.vue'

import ModalDataset from '@/components/ModalDataset.vue'

import ckan from '@/mixins/ckan.js'

export default {
  name: 'TheForm',
  components: {
    FormAPIKey,
    FormDataset,
    FormInstance,
    ErrorMessage,
    ModalDataset
  },
  mixins: [
    ckan
  ],
  methods: {
    load: async function () {
      let content = await this.getDataset(this.local)
      for (let [key, value] of Object.entries(content)) {
        this.$set(this.local, key, value)
      }
    },
    replicate: async function () {
      // Update the local package organization ID with the remote organization ID
      let remoteOrganization = await this.getOrganization(this.local)
      this.$set(this.remote, 'organization', remoteOrganization)

      // Replicate the local package in remote
      let replicant = await this.createDataset(this.remote, this.local.dataset)
      this.$set(this.remote, 'dataset', replicant)

      // Replicate the resources
      for (let resource of this.local.resources) {
        if (resource.datastore_active) {
          await this.createDatastore(this.local, this.remote, resource)
        } else {
          await this.createResource(this.remote, resource)
        }
      }

      await this.publishDataset(this.remote)

      await this.deleteDataset(this.local)

      return true
    },
    set: function (value, loc, key) {
      let update = loc == 'local' ? this.local : this.remote
      let fail = false

      if (key == 'url') {
        try {
          this.$set(update, key, new URL(value))

          if (this.remote.url.origin == this.local.url.origin) {
            this.error.type = 'duplicate'
            this.error.title = 'Origin and destination CKAN instances can not be the same'
            fail = true
          }
        } catch {
          this.error.type = 'url'
          this.error.title = 'Invalid URL'
          fail = true
        }
      } else {
        this.$set(update, key, value)
      }

      if (!fail) {
        this.error.type = ''
        this.error.title = ''
        fail = true
      }
    },
    toggle: function () {
      if (!this.state.open) {
        if (!this.local.url || !this.local.key || !this.remote.url || !this.remote.key) {
          this.error.type = 'missing'
          this.error.title = 'Missing required fields'
        } else if (this.error.type.length === '') {
          this.state.open = true

          // TODO: spin wheel while loading on the button before showing modal
          this.load()
        }
      } else {
        this.state.open = false
      }
    }
  },
  data () {
    return {
      local: {
        url: new URL('http://localhost:5000/dataset/example-geospatial-polygons-data'),
      },
      remote: {
        url: new URL('http://localhost:5000'),
        key: '3273a057-d6dc-482d-8a79-2a3615e9136e'
      },
      error: {
        type: '',
        title: ''
      },
      state: {
        open: false
      }
    }
  }
}
</script>
