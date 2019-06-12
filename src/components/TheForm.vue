<template>
  <div is="sui-container">
    <sui-form @submit.prevent="replicate">
      <sui-grid divided="vertically">
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Source</sui-header>
              <sui-segment attached="bottom">
                <FormDataset @change="set"/>
                <FormAPIKey location="local" @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Target</sui-header>
              <sui-segment attached="bottom">
                <FormInstance @change="set"/>
                <FormAPIKey location="remote" @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
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

import ModalDataset from '@/components/ModalDataset.vue'

import ckan from '@/mixins/ckan.js'

export default {
  name: 'TheForm',
  components: {
    FormAPIKey,
    FormDataset,
    FormInstance,
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

      for (let resource of this.local.resources) {
        if (resource.datastore_active) {
          await this.createDatastore(this.local, this.remote, resource)
        } else {
          await this.createResource(this.remote, resource)
        }
      }

      await this.publishDataset(this.remote)

      return true
    },
    set: function (value, loc, key) {
      let update = loc == 'local' ? this.local : this.remote

      this.$set(update, key, value)
    },
    toggle: function () {
      if (!this.state.open) {
        // TODO: assert if urls are URL and no missing
        this.validate()

        // TODO: spin wheel while loading on the button before showing modal
        this.load()
      }

      this.state.open = !this.state.open
    },
    validate: function () {
      this.error = true
      // duplicate = this.local.url && this.remote.url && this.local.url.host === this.remote.url.host
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
      state: {
        open: false,
        error: false
      }
    }
  }
}
</script>
