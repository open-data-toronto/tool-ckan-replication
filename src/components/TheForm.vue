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
    // load() fetches package metadata from the source CKAN
    load: async function () {
      let content = await this.getDataset(this.local)

      for (let [key, value] of Object.entries(content)) {
        this.$set(this.local, key, value)
      }
    },

    // replicate() creates the source package and resources in the target CKAN
    replicate: async function () {
      try {
        // Fetches the target organization
        let remoteOrganization = await this.getOrganization(this.local)
        this.$set(this.remote, 'organization', remoteOrganization)

        // Replicate the source package in target
        let replicant = await this.createDataset(this.remote, this.local.dataset)
        this.$set(this.remote, 'dataset', replicant)

        // Replicate the resources
        for (let [idx, resource] of this.local.resources.entries()) {
          if (resource.datastore_active) {
            await this.createDatastore(this.local, this.remote, this.local.resourceIDs[idx], resource)
          } else {
            await this.createResource(this.remote, resource)
          }
        }

        // Publish the created target package
        await this.publishDataset(this.remote)

        // Deletes the original source package
        // TODO: what happens if function fails at this step?
        // TODO: do not delete if moving from prod to staging
        await this.deleteDataset(this.local)
      } catch {
        await this.deleteDataset(this.remote)
      }

      return true
    },

    // set() updates and validates the input variables
    set: function (value, loc, key) {
      let update = loc === 'local' ? this.local : this.remote

      this.state.error = null
      if (key === 'url') {
        // Try to convert the input string to an URL
        try {
          this.$set(update, key, new URL(value))

          // Validate the the source and target URLs are not the same
          if (this.remote.hasOwnProperty('url') && this.local.hasOwnProperty('url') && this.remote.url.origin === this.local.url.origin) {
            this.state.error = this.errors.duplicate
          }
        } catch {
          this.state.error = this.errors.url
        }
      } else {
        this.$set(update, key, value)
      }
    },

    // toggle() show/hides the validate metadata modal
    toggle: function () {
      if (!this.state.open) {
        if (!this.local.url || !this.local.key || !this.remote.url || !this.remote.key) {
          this.state.error = this.errors.missing
        } else if (this.state.error === null) {
          this.state.open = true

          // Reload the entire modal on every show since no validation on if
          // source URL changed when hiden
          this.load()
        }
      } else {
        this.state.open = false
      }
    }
  },
  data () {
    return {
      // CKAN info and model metadata from the source
      local: {},

      // CKAN info and model metadata created in the target
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
