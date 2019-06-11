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
          <ModalDataset :data="data" :open="viewing" @toggle="toggle" @submit="replicate"/>
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

      axios
        .get(this.source.url.origin + '/api/3/action/package_show?id=' + this.source.url.pathname.split('/')[2])
        .then(response => {
          const result = response.data.result

          this.data = {}

          this.data.organization = (
            ({ name, title, description }) =>
            ({ name, title, description })
          )(result.organization)

          this.data.dataset = (
            ({ name, title, notes, collection_method, excerpt, limitations, information_url, dataset_category, is_retired, refresh_rate, topics, owner_division, owner_section, owner_unit, owner_email, image_url }) =>
            ({ name, title, notes, collection_method, excerpt, limitations, information_url, dataset_category, is_retired, refresh_rate, topics, owner_division, owner_section, owner_unit, owner_email, image_url })
          )(result)

          this.data.resources = result.resources.map(
            r => (
              ({ id, name, description, datastore_active, url, extract_job, format }) =>
              ({ id, name, description, datastore_active, url, extract_job, format })
            )(r)
          )

          this.viewing = true
        })
    },
    replicate: async function () {
      const organization = await axios.get(this.source.url.origin + '/api/3/action/organization_show?id=' + this.data.organization.name)
      this.data.dataset.owner_org = organization.data.result.id
      this.data.dataset.name += 'test'
      this.data.dataset.owner_org = 'e1d223a3-f1bd-4933-b49e-24786cee2af3'

      Object.keys(this.data.dataset).forEach((key) => (this.data.dataset[key] == null) && delete this.data.dataset[key]);

      const dataset = await axios.post(
        this.target.url.origin + '/api/3/action/package_create',
        this.data.dataset,
        { headers: { 'Authorization' : this.target.key } }
      )

      const dataset = await axios.get(this.target.url.origin + '/api/3/action/package_show?id=example-geospatial-polygons-datatest')

      for (const i in this.data.resources) {
        let resource = this.data.resources[i]

        resource.package_id = dataset.data.result.id
        resource.url_type = 'upload'
        resource.format = resource.format.toUpperCase()

        Object.keys(resource).forEach((key) => (resource[key] == null) && delete resource[key]);

        if (resource.datastore_active) {
          let metadata = await axios.get(
            this.source.url.origin + '/api/3/action/datastore_search',
            {
              params: {
                resource_id: resource.id,
                include_total: true,
                limit: 0
              }
            }
          )

          let content = await axios.get(
            this.source.url.origin + '/api/3/action/datastore_search',
            {
              params: {
                resource_id: resource.id,
                include_total: false,
                limit: metadata.data.result.total
              }
            }
          )

          for (const row in content.data.result.records) {
            delete content.data.result.records[row]._id
          }

          delete resource.id

          await axios.post(
            this.target.url.origin + '/api/3/action/datastore_create',
            {
              resource: resource,
              fields: metadata.data.result.fields,
              records: content.data.result.records
            },
            { headers: { 'Authorization' : this.target.key } }
          )

        } else {
          continue
          delete resource.id
          await axios.post(
            this.target.url.origin + '/api/3/action/resource_create',
            resource,
            { headers: { 'Authorization' : this.target.key } }
          )
        }
      }
    },
    // TODO: merge set functions
    setAPIKey: function (val, inst) {
      this[inst].key = val
    },
    setDataset: function (val) {
      this.source.url = val
    },
    setInstance: function (val) {
      this.target.url = val
    },
    toggle: function () {
      if (!this.viewing) { // before show - always load the dataset (ie. changes to the dataset input not tracked)
        // TODO: spin wheel while loading on the button before showing modal
        this.load()
      } else {
        this.viewing = false
      }
    },
    validate: function () {
      this.error = true
      // duplicate = this.source.url && this.target.url && this.source.url.host === this.target.url.host
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
      source: {
        url: new URL('http://localhost:5000/dataset/example-geospatial-polygons-data'),
        key: ''
      },
      target: {
        url: new URL('http://localhost:5000'),
        key: '3273a057-d6dc-482d-8a79-2a3615e9136e'
      }
    }
  }
}
</script>
