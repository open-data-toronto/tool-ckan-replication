<template>
  <div is="sui-container">
    <sui-form>
      <sui-grid>
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Origin</sui-header>
              <sui-segment attached="bottom">
                <FormInput
                  title="Package URL"
                  placeholder="https://ckanadmin.prod-toronto.ca/dataset/permit"
                  icon="linkify"
                  :error="hasError"
                  @change="set"/>
                <FormSecret
                  title="API Key"
                  name="local"
                  :error="errors.missing.show"
                  @change="set"/>
                <FormToggle
                  title="Remove on Complete?"
                  name="purge"
                  :default="this.state.purge"
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
                <FormDropdown
                  title="CKAN Instance"
                  :options="instances"
                  :error="errors.duplicate.show || errors.missing.show"
                  @change="set"/>
                <FormSecret
                  title="API Key"
                  name="remote"
                  :error="errors.missing.show"
                  @change="set"/>
                <FormToggle
                  title="Keep Private?"
                  name="secret"
                  :default="this.state.secret"
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
import FormSecret from '@/components/FormSecret.vue'
import FormInput from '@/components/FormInput.vue'
import FormDropdown from '@/components/FormDropdown.vue'
import FormToggle from '@/components/FormToggle.vue'

import ErrorMessage from '@/components/ErrorMessage.vue'

import ModalDataset from '@/components/ModalDataset.vue'

import ckan from '@/mixins/ckan.js'

export default {
  name: 'TheForm',
  components: {
    FormSecret,
    FormInput,
    FormDropdown,
    FormToggle,
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
      let dID = this.local.url.pathname.split('/')[2]

      let content = await this.getDataset(this.local, dID)
      for (let [key, value] of content.entries()) {
        this.$set(this.local, key, value)
      }

      let original = await this.getDataset(this.remote, dID)
      for (let [key, value] of original.entries()) {
        this.$set(this.remote, key, value)
      }

      // Validate if original is an empty object and exist in target CKAN
      if (Object.keys(original).length !== 0) {
        this.$set(this.state, create, false)
        this.$set(this.delta, this.findDifference(content, original))

        let cResourceMap = convertMap(content.resources, 'name')
        let oResourceMap = convertMap(original.resources, 'name')

        let resourceDelta = {}
        for (let r of cResourceMap) {
          if (!oResourceMap.hasOwnProperty(r.name)) {
            resourceDelta[r.name] = 'insert'
          } else {
            resourceDelta[r.name] = this.findDifference(cResourceMap[r.name], oResourceMap[r.name])
          }
        }

        for (let r of oResourceMap) {
          if (!a.hasOwnProperty(r.name)) {
            resourceDelta[r.name] = 'delete'
          }
        }

        this.$set(this.delta, 'resources', resourceDelta)
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
        if (this.local.url.origin !== 'https://ckanadmin.prod-toronto.ca') {
          await this.deleteDataset(this.local)
        }
      } catch {
        await this.deleteDataset(this.remote)
      }

      return true
    },

    // set() updates and validates the input variables
    set: function (value, loc, key) {
      console.log(value, loc, key)
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

      // object tracking changes between local and remote CKAN instances
      delta: {},

      state: {
        create: true, // track if package needs to be create in remote CKAN
        error: null, // track error state
        open: false, // track if modal is open
        purge: true, // track if package should be cleaned up from local CKAN
        secret: false // track if remote package created should be kept private
      },
      instances: [
        { text: 'Development', value: 'http://localhost:5000' },
        { text: 'Staging', value: 'https://ckanadmin0.intra.qa-toronto.ca' },
        { text: 'Production', value: 'https://ckanadmin.intra.prod-toronto.ca' }
      ],
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
