<template>
  <div is="sui-container">
    <sui-form>
      <sui-grid>
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Origin</sui-header>
              <sui-segment attached="bottom">
                <FormDataset :error="state.error !== null && (state.error.type === 'duplicate' || state.error.type === 'url')" @change="set"/>
                <FormAPIKey location="local" @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Destination</sui-header>
              <sui-segment attached="bottom">
                <FormInstance :error="state.error !== null && state.error.type === 'duplicate'" @change="set"/>
                <FormAPIKey location="remote" @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
        <sui-grid-row centered>
          <ErrorMessage :title="state.error !== null ? state.error.title : ''" v-show="state.error !== null"/>
        </sui-grid-row>
        <sui-grid-row centered>
          <ModalDataset :data="local" :open="state.open" @toggle="toggle" @submit="replicate"/>
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
      let update = loc === 'local' ? this.local : this.remote

      this.state.error = null
      if (key === 'url') {
        try {
          this.$set(update, key, new URL(value))

          if (this.remote.hasOwnProperty('url') && this.local.hasOwnProperty('url') && this.remote.url.origin === this.local.url.origin) {
            if (this.remote.url.origin !== 'http://localhost:5000') {
              this.state.error = this.errors.duplicate
            }
          }
        } catch {
          this.state.error = this.errors.url
        }
      } else {
        this.$set(update, key, value)
      }
    },
    toggle: function () {
      if (!this.state.open) {
        if (!this.local.url || !this.local.key || !this.remote.url || !this.remote.key) {
          this.state.error = this.errors.missing
        } else if (this.state.error === null) {
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
      local: {},
      remote: {},
      state: {
        open: false,
        error: null
      },
      errors: {
        duplicate: {
          key: 'duplicate',
          title: 'Origin and destination CKAN instances can not be the same'
        },
        missing: {
          key: 'missing',
          title: 'Please fill in all required fields'
        },
        url: {
          key: 'url',
          title: 'Package is not from a valid CKAN URL'
        }
      }
    }
  }
}
</script>
