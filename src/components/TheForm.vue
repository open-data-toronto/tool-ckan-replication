<template>
  <div is="sui-container">
    <sui-form>
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
    clean: function (obj) {
      Object.keys(obj).forEach(
        (key) => (obj[key] == null) && delete obj[key]
      )
    },
    buildURL: function (loc, endpoint) {
      return loc.url.origin + '/api/3/action/' + endpoint
    },
    rollback: async function (err) {
      console.log(err)

      for (let r in this.remote.resources) {
        await axios({
          method: 'get',
          url: this.buildURL(this.remote, 'resource_delete'),
          params: {
            id: this.remote.resources[r].id
          }
        })
      }

      await axios({
        method: 'get',
        url: this.buildURL(this.remote, 'package_delete'),
        params: {
          id: this.remote.package.id
        }
      })
    },
    load: function () {
      // TODO: assert if urls are URL and no missing
      this.validate()

      axios({
        method: 'get',
        url: this.buildURL(this.local, 'package_show'),
        params: {
          'id': this.local.url.pathname.split('/')[2]
        }
      }).then(response => {
        let result = response.data.result

        this.$set(this.local, 'organization', (({ name, title, description }) => ({ name, title, description }))(result.organization))
        this.$set(
          this.local,
          'dataset',
          (
            ({ name, title, notes, collection_method, excerpt, limitations, information_url, dataset_category, is_retired, refresh_rate, topics, owner_division, owner_section, owner_unit, owner_email, image_url }) =>
            ({ name, title, notes, collection_method, excerpt, limitations, information_url, dataset_category, is_retired, refresh_rate, topics, owner_division, owner_section, owner_unit, owner_email, image_url })
          )(result)
        )
        this.$set(
          this.local,
          'resources',
          result.resources.map(
            r => (
              ({ id, name, description, datastore_active, url, extract_job, format }) =>
              ({ id, name, description, datastore_active, url, extract_job, format })
            )(r)
          )
        )

        this.state.open = true
      })
    },
    replicate: async function () {
      this.$set(
        this.remote,
        'organization',
        await axios({
          method: 'get',
          url: this.buildURL(this.remote, 'organization_show'),
          params: {
            id: this.local.organization.name
          }
        }).then(
          response => response.data.result
        )
      )

      this.local.dataset.owner_org = this.remote.organization.id

      this.local.dataset.name += '-test'
      this.local.dataset.owner_org = 'e1d223a3-f1bd-4933-b49e-24786cee2af3'

      this.clean(this.local.dataset)
      this.$set(
        this.remote,
        'dataset',
        await axios({
          method: 'post',
          url: this.buildURL(this.remote, 'package_create'),
          data: this.local.dataset,
          headers: {
            'Authorization' : this.remote.key
          }
        }).then(
          response => response.data.result
        )
      )

      for (let i in this.local.resources) {
        let resource = this.local.resources[i]

        resource.package_id = this.remote.dataset.id
        resource.format = resource.format.toUpperCase()

        this.clean(resource)

        if (resource.datastore_active) {
          let metadata = await axios({
            method: 'get',
            url: this.buildURL(this.local, 'datastore_search'),
            params: {
              resource_id: resource.id,
              include_total: true,
              limit: 0
            }
          }).then(
            response => response.data.result
          )

          let content = await axios({
            method: 'get',
            url: this.buildURL(this.local, 'datastore_search'),
            params: {
              resource_id: resource.id,
              limit: metadata.total
            }
          }).then(
            response => response.data.result
          )

          for (let row in content.records) {
            delete content.records[row]._id
          }

          metadata.fields = metadata.fields.filter(row => row.id != '_id')

          delete resource.id
          delete resource.url
          await axios({
            method: 'post',
            url: this.buildURL(this.remote, 'datastore_create'),
            data: {
              resource: resource,
              fields: metadata.fields,
              records: content.records
            },
            headers: {
              'Authorization' : this.remote.key
            }
          })
        } else {
          resource.url_type = 'upload'

          delete resource.id
          await axios({
            method: 'post',
            url: this.buildURL(this.remote, 'resource_create'),
            data: resource,
            headers: {
              'Authorization' : this.remote.key
            }
          })
        }
      }
    },
    set: function (value, loc, key) {
      if (loc == 'local') {
        this.$set(this.local, key, value)
      } else {
        this.$set(this.remote, key, value)
      }
    },
    toggle: function () {
      if (!this.state.open) { // before show - always load the dataset (ie. changes to the dataset input not tracked)
        // TODO: spin wheel while loading on the button before showing modal
        this.load()
      } else {
        this.state.open = false
      }
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
