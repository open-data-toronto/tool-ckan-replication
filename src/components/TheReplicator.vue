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
                  placeholder="https://ckanadmin0.prod-toronto.ca/dataset/pkg"
                  icon="linkify"
                  :error="hasError"
                  @change="set"/>
                <FormSecret
                  title="API Key"
                  name="from"
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
                  name="to"
                  :error="errors.missing.show"
                  @change="set"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
        <ErrorMessage :errors="errors" v-show="hasError"/>
        <sui-grid-row centered>
          <ModalDataset
            :open="state.display"
            :dim="state.wait"
            :content="content"
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

import json from '@/assets/config.json'

const axios = require('axios')

export default {
  name: 'TheReplicator',
  components: {
    FormSecret,
    FormInput,
    FormDropdown,
    ErrorMessage,
    ModalDataset
  },
  computed: {
    pID: function () {
      return this.from.url.pathname.split('/')[2]
    },
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
    display: async function () {
      await axios({
        method: 'post',
        url: this.config.controller,
        data: {
          from: {
            address: this.from.url.origin,
            apikey: this.from.key
          },
          to: {
            address: this.to.url.origin,
            apikey: this.to.key
          },
          package: this.pID,
          step: 'display'
        },
        headers: {
          'X-Api-Key': this.config.secret
        }
      }).then(
        response => {
          this.$set(this.state, 'mode', response.data.mode)

          let result = response.data.package
          this.$set(this.content, 'dataset', {
            name: result.name,
            title: result.title,
            collection_method: result.collection_method,
            excerpt: result.excerpt,
            limitations: result.limitations,
            notes: result.notes,
            dataset_category: result.dataset_category,
            information_url: result.information_url,
            image_url: result.image_url,
            is_retired: result.is_retired,
            refresh_rate: result.refresh_rate,
            tags: result.tags.map(
              t => t.name
            ).join(','),
            topics: result.topics,
            owner_division: result.owner_division,
            owner_section: result.owner_section,
            owner_unit: result.owner_unit,
            owner_email: result.owner_email
          })

          this.$set(this.content, 'resources', result.resources.map(
            r => {
              return {
                id: r.id,
                name: r.name,
                description: r.description,
                datastore_active: r.datastore_active,
                url: r.url,
                url_type: r.url_type,
                extract_job: r.extract_job,
                format: r.format
              }
            })
          )
        }
      )
    },

    // replicate() creates the source package and resources in the target CKAN
    replicate: async function () {
      // let verb = this.state.mode === 'create' ? 'Creating' : 'Updating'
      // this.$set(this.state, 'wait', true)
      //
      // // do repliaction stuff here
      //
      // this.$set(this.state, 'display', false)
      // window.open(
      //   `${this.to.url.origin}/dataset/${this.pID}`,
      //   '_blank'
      // )
      // this.$set(this.state, 'wait', false)
    },

    // set() updates and validates the input variables
    set: function (value, loc, key) {
      let update = loc === 'from' ? this.from : this.to

      if (key === 'url') {
        // Try to convert the input string to an URL
        if (loc === 'from') {
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
          this.to.hasOwnProperty('url') &&
          this.from.hasOwnProperty('url')
        ) {
          this.errors.duplicate.show =
            this.to.url.origin === this.from.url.origin &&
            this.to.url.origin.indexOf('localhost') === -1
        }
      } else {
        this.$set(update, key, value)
      }
    },

    // toggle() show/hides the validate metadata modal
    toggle: function () {
      if (!this.state.display) {
        this.errors.missing.show = (
          !this.from.url ||
          !this.from.key ||
          !this.to.url ||
          !this.to.key
        )

        if (!this.hasError) {
          this.$set(this.state, 'display', true)

          // Reload the entire modal on every show since no validation on if
          // source URL changed when hiden
          this.display()
        }
      } else {
        this.$set(this.state, 'display', false)
      }
    }
  },

  data () {
    return {
      config: json,
      from: {
        url: new URL('https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/bodysafe'),
        key: '1'
      },
      to: {
        url: new URL('https://ckan0.cf.opendata.inter.prod-toronto.ca'),
        key: '2'
      },
      content: {},
      state: {
        display: false, // track if modal is open
        wait: false, // track if loading content to CKAN
        mode: '' // track if package needs to be create in remote CKAN
      },
      instances: [
        // { text: 'DEV0 : Development', value: 'https://ckanadmin0.intra.dev-toronto.ca' },
        { text: 'DEV0 : Development', value: 'http://localhost:5000' },
        { text: 'QA0  : Staging', value: 'https://ckanadmin0.intra.qa-toronto.ca' },
        { text: 'PROD : Production', value: 'https://ckanadmin0.intra.prod-toronto.ca' }
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
