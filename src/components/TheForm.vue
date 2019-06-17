<template>
  <div is="sui-container">
    <sui-form>
      <sui-grid>
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Origin</sui-header>
              <sui-segment attached="bottom">
                <FormDataset :error="hasError" @change="set"/>
                <FormAPIKey
                  location="local"
                  :error="errors.missing.show"
                  @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">
                Destination
              </sui-header>
              <sui-segment attached="bottom">
                <FormInstance
                  :error="errors.duplicate.show || errors.missing.show"
                  @change="set"/>
                <FormAPIKey
                  location="remote"
                  :error="errors.missing.show"
                  @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
        <ErrorMessage :errors="errors" v-show="hasError"/>
        <sui-grid-row centered>
          <ModalDataset
            :data="local"
            :open="state.open"
            @toggle="toggle"
            @submit="replicate"/>
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
  computed: {
    hasError: function () {
      for (let error of Object.values(this.errors)) {
        if (error.show) {
          return true
        }
      }

      return false
    }
  },
  methods: {
    // load() fetches package metadata from the source CKAN and checks if the
    // package exists in remote CKAN
    load: async function () {
      let { content, origin } = await this.getDataset(
        this.local,
        this.remote,
        this.local.url.pathname.split('/')[2]
      )

      for (let [key, value] of Object.entries(content)) {
        this.$set(this.local, key, value)
      }

      for (let [key, value] of Object.entries(origin)) {
        this.$set(this.remote, key, value)
      }
    },

    // replicate() creates the source package and resources in the target CKAN
    replicate: async function () {
      try {
        // Fetches the target organization
        let remoteOrganization = await this.getOrganization(this.local)
        this.$set(this.remote, 'organization', remoteOrganization)

        // Replicate the source package in target
        let replicant = await this.createDataset(
          this.remote,
          this.local.dataset
        )
        this.$set(this.remote, 'dataset', replicant)

        // Replicate the resources
        for (let [idx, resource] of this.local.resources.entries()) {
          if (resource.datastore_active) {
            await this.createDatastore(
              this.local,
              this.remote,
              this.local.resourceIDs[idx],
              resource
            )
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

      if (key === 'url') {
        // Try to convert the input string to an URL
        if (loc === 'local') {
          try {
            this.$set(update, key, new URL(value))

            this.errors.url.show = false
          } catch {
            this.$set(update, key, '')

            this.errors.url.show = true
          }
        } else {
          this.$set(update, key, new URL(value))
        }

        // Validate the the source and target URLs are not the same
        if (
          this.remote.hasOwnProperty('url') &&
          this.local.hasOwnProperty('url')
        ) {
          this.errors.duplicate.show =
            this.remote.url.origin === this.local.url.origin
        }
      } else {
        this.$set(update, key, value)
      }
    },

    // toggle() show/hides the validate metadata modal
    toggle: function () {
      if (!this.state.open) {
        this.errors.missing.show = (
          !this.local.url ||
          !this.local.key ||
          !this.remote.url ||
          !this.remote.key
        )

        if (!this.hasError) {
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
          title: 'Origin and destination CKAN instances can not be the same',
          show: false
        },
        missing: {
          key: 'missing',
          title: 'Please fill in all required fields',
          show: false
        },
        url: {
          key: 'url',
          title: 'Package is not from a valid CKAN URL',
          show: false
        }
      }
    }
  }
}
</script>
