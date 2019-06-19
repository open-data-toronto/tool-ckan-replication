const axios = require('axios')

export default {
  methods: {
    /**
     * buildEndpoint() creates the CKAN API URL
     *
     * @param {Object} context  - CKAN state object
     * @param {String} endpoint - endpoint name
     *
     * @return {String} URL for the API endpoint
     */
    buildEndpoint: function (context, endpoint) {
      return context.url.origin + '/api/3/action/' + endpoint
    },

    /**
     * getOrganization() fetches the organization metadata
     *
     * @param {Object} context - CKAN state object
     *
     * @return {Object} CKAN organization
     */
    getOrganization: function (context) {
      return axios({
        method: 'get',
        url: this.buildEndpoint(context, 'organization_show'),
        params: {
          // Matches organization by name (instead of ID)
          id: context.organization.name
        }
      }).then(
        response => response.data.result
      )
    },

    /**
     * getDataset() organizes the package metadata
     *
     * @params {Object} response - response from pacakge_show request
     *
     * @return {Object} CKAN package with unneeded fields removed
     */
    getDataset: function (context, datasetID) {
      return axios({
        method: 'get',
        url: this.buildEndpoint(context, 'package_show'),
        params: {
          // Parse out the package name assuming that the URL is the path to the
          // dataset (eg. <protocol>://<host>/dataset/<package-name>)
          'id': datasetID
        }
      }).then(response => {
        let result = response.data.result
        let content = {}

        // Store IDs separately to be referenced later for clean up/rollbacks
        content.datasetID = result.id
        content.resourceIDs = result.resources.map(r => r.id)

        // Clean up unnecessary fields (eg. IDs, dates) so that the entire
        // object can be used later during create functions
        content.organization = {
          name: result.organization.name,
          title: result.organization.title,
          description: result.organization.description
        }

        content.dataset = {
          name: result.name,
          title: result.title,
          notes: result.notes,
          collection_method: result.collection_method,
          excerpt: result.excerpt,
          limitations: result.limitations,
          information_url: result.information_url,
          dataset_category: result.dataset_category,
          is_retired: result.is_retired,
          refresh_rate: result.refresh_rate,
          topics: result.topics,
          owner_division: result.owner_division,
          owner_section: result.owner_section,
          owner_unit: result.owner_unit,
          owner_email: result.owner_email,
          image_url: result.image_url
        }

        content.resources = result.resources.map(
          r => function() {
            return {
              name: r.name,
              description: r.description,
              datastore_active: r.datastore_active,
              url: r.url,
              extract_job: r.extract_job,
              format: r.format
            }
          }
        )

        return content
      }).catch(e => {
        return null
      })
    },

    /**
     * createDataset() creates package
     *
     * @param {Object} context - CKAN state object
     * @param {Object} dataset - metadata of the dataset to be created
     *
     * @return {Object} created CKAN package
     */
    createDataset: function (context, dataset) {
      // Update the dataset organization ID as the target organization ID
      dataset.owner_org = context.organization.id

      // Hide the dataset initially on create in case of failures
      dataset.private = true

      return axios({
        method: 'post',
        url: this.buildEndpoint(context, 'package_create'),
        data: dataset,
        headers: {
          'Authorization': context.key
        }
      }).then(
        response => response.data.result
      )
    },

    /**
     * createResource() creates FileStore resource
     *
     * @param {Object} context  - CKAN state object
     * @param {Object} resource - metadata of the resource to be created
     *
     * @return {Object} created CKAN resource
     */
    createResource: function (context, resource) {
      resource.package_id = context.dataset.id

      // Configure the FileStore content to be created by uploading the content
      // of the resource URL field
      resource.url_type = 'upload'

      return axios({
        method: 'post',
        url: this.buildEndpoint(context, 'resource_create'),
        data: resource,
        headers: {
          'Authorization': context.key
        }
      })
    },

    /**
     * createDatastore() creates DataStore resource
     *
     * @param {Object} local      - source CKAN state object
     * @param {Object} remote     - target CKAN state object
     * @param {Object} resourceID - ID of the source resource
     * @param {Object} resource   - metadata of the resource to be created
     *
     * @return {Object} created CKAN resource
     */
    createDatastore: async function (local, remote, resourceID, resource) {
      // Remove the resource URL since it will generate a CSV
      // TODO: alternatively, we can use the original DataStore dump URL and
      // create the records from the generated CSV but need to test if this will
      // maintain the same data dictionary
      delete resource.url

      resource.package_id = remote.dataset.id

      // Fetch the data dictionary and number of records from the source CKAN
      let { fields, total } = await axios({
        method: 'get',
        url: this.buildEndpoint(local, 'datastore_search'),
        params: {
          resource_id: resourceID,
          limit: 0,
          include_total: true
        }
      }).then(
        response => response.data.result
      )

      // Fetch all the data from the source ckan
      // TODO: pagination
      let { records } = await axios({
        method: 'get',
        url: this.buildEndpoint(local, 'datastore_search'),
        params: {
          resource_id: resourceID,
          limit: total
        }
      }).then(
        response => response.data.result
      )

      // Remove the auto-generated '_id' field from the records and fields
      for (let field of records) {
        delete field._id
      }

      fields = fields.filter(row => row.id !== '_id')

      return axios({
        method: 'post',
        url: this.buildEndpoint(remote, 'datastore_create'),
        data: {
          resource: resource,
          fields: fields,
          records: records
        },
        headers: {
          'Authorization': remote.key
        }
      })
    },

    /**
     * publishDataset() sets package from private to public
     *
     * @param {Object} context - CKAN state object
     */
    publishDataset: function (context) {
      axios({
        method: 'post',
        url: this.buildEndpoint(context, 'package_patch'),
        data: {
          id: context.dataset.id,
          private: false
        },
        headers: {
          'Authorization': context.key
        }
      })
    },

    /**
     * deleteDataset() deletes package
     *
     * @param {Object} context - CKAN state object
     */
    deleteDataset: async function (context) {
      // Delete the resources from the package one by one because CKAN doesn't
      // remove datastore tables correctly when deleting from package level
      // directly
      for (let rid of context.resourceIDs) {
        await axios({
          method: 'post',
          url: this.buildEndpoint(context, 'resource_delete'),
          data: {
            id: rid
          },
          headers: {
            'Authorization': context.key
          }
        })
      }

      await axios({
        method: 'post',
        url: this.buildEndpoint(context, 'package_delete'),
        data: {
          id: context.datasetID
        },
        headers: {
          'Authorization': context.key
        }
      })
    }
  }
}
