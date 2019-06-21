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
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
        <ErrorMessage :errors="errors" v-show="hasError"/>
        <sui-grid-row centered>
          <ModalDataset
            :open="state.validating"
            :dim="state.loading"
            :progress="state.progress"
            :content="local"
            :title="this.state.mode == 'create'
              ? 'New Dataset' : 'Update Dataset'"
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

import ErrorMessage from '@/components/ErrorMessage.vue'

import ModalDataset from '@/components/ModalDataset.vue'

import ckan from '@/mixins/ckan.js'

export default {
  name: 'TheForm',
  components: {
    FormSecret,
    FormInput,
    FormDropdown,
    ErrorMessage,
    ModalDataset
  },
  mixins: [ ckan ],
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

      this.local = Object.assign(
        await this.getDataset(this.local, dID),
        this.local
      )

      // Fetches the target organization
      let remoteOrganization = await this.getOrganization(
        this.remote,
        this.local.organization.name
      )
      this.$set(this.remote, 'organization', remoteOrganization)

      let remoteDataset = await this.getDataset(this.remote, dID)
      if (remoteDataset !== null) {
        this.remote = Object.assign(remoteDataset, this.remote)
        this.$set(this.state, 'mode', 'update')
      } else {
        this.$set(this.remote, 'resources', [])
      }
    },

    // replicate() creates the source package and resources in the target CKAN
    replicate: async function () {
      let verb = this.state.mode === 'create' ? 'Creating' : 'Updating'
      this.$set(this.state, 'loading', true)

      let remoteDataset
      try {
        this.$set(this.state, 'progress', `${verb} dataset`)
        remoteDataset = await this.touchDataset(
          this.state.mode,
          this.remote,
          this.local.dataset
        )
        this.$set(this.remote, 'dataset', remoteDataset)

        let localResources = []
        for (let [idx, resource] of this.local.resources.entries()) {
          this.$set(
            this.state,
            'progress',
            `${verb} resources (${idx + 1} of ${this.local.resources.length})`
          )

          if (resource.datastore_active) {
            await this.touchDatastore(this.local, this.remote, resource)
          } else {
            await this.touchResource(this.local, this.remote, resource)
          }

          localResources.push(resource.name)
        }

        for (let resource of this.remote.resources) {
          if (localResources.indexOf(resource.name) === -1) {
            this.$set(this.state, 'progress', `Deleting old resources`)
            await this.deleteResource(this.remote, resource.id)
          }
        }

        // Deletes the original source package
        if (
          this.state.mode === 'create' &&
          this.local.url.origin !== this.instances[2].value
        ) {
          this.$set(this.state, 'progress', 'Deleting original dataset')
          await this.deleteDataset(this.local)
        }
      } catch (e) {
        // Rollback on update should be different
        this.$set(this.state, 'progress', 'Rolling back changes')
        if (this.state.mode === 'create') {
          await this.deleteDataset(this.remote)
        }
      }

      this.$set(this.state, 'validating', false)
      window.open(
        `${this.remote.url.origin}/dataset/${remoteDataset.name}`,
        '_blank'
      )

      this.$set(this.state, 'progress', '')
      this.$set(this.state, 'loading', false)
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
      if (!this.state.validating) {
        this.errors.missing.show = (
          !this.local.url ||
          !this.local.key ||
          !this.remote.url ||
          !this.remote.key
        )

        if (!this.hasError) {
          this.state.validating = true

          // Reload the entire modal on every show since no validation on if
          // source URL changed when hiden
          this.load()
        }
      } else {
        this.state.validating = false
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
        mode: 'create', // track if package needs to be create in remote CKAN
        progress: '', // track loading progress
        error: null, // track error state
        loading: false, // track if loading content to CKAN
        validating: false, // track if modal is open
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
