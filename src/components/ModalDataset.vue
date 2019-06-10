<template lang="html">
  <div>
    <sui-button basic
      type="button"
      content="Show Data"
      icon="right arrow"
      label-position="right"
      @click="$emit('toggle')"/>
    <sui-modal v-model="open" v-bind:closable="false">
      <sui-modal-header>{{ data !== null ? data.title : '' }}</sui-modal-header>
      <sui-modal-content scrolling>
        <sui-modal-description v-if="data !== null">
          <TableDisplay title='Organization' v-bind:fields='fields["organization"]' v-bind:data='data["organization"]'/>
          <TableDisplay title='Dataset' v-bind:fields='fields["dataset"]' v-bind:data='data'/>
          <TableDisplay title='Resource' v-for="resource in data['resources']" v-bind:fields='fields["resource"]' v-bind:data='resource'/>
        </sui-modal-description>
      </sui-modal-content>
      <sui-modal-actions>
        <sui-button negative @click="$emit('toggle')">Cancel</sui-button>
        <sui-button primary @click="$emit('submit')">Submit</sui-button>
      </sui-modal-actions>
    </sui-modal>
  </div>
</template>

<script>
import TableDisplay from '@/components/TableDisplay.vue'

export default {
  name: 'ModalExample',
  components: {
    TableDisplay
  },
  props: {
    data: Object,
    open: Boolean
  },
  data () {
    return {
      fields: {
        organization: ['id', 'name', 'title', 'description'],
        dataset: ['id', 'name', 'title', 'notes', 'collection_method', 'excerpt', 'limitations', 'information_url', 'dataset_category', 'is_retired', 'refresh_rate', 'last_refreshed', 'formats', 'topics', 'owner_division', 'owner_section', 'owner_unit', 'owner_email', 'image_url'],
        resource: ['id', 'name', 'description', 'datastore_active', 'url', 'extract_job', 'format']
      }
    }
  }
}
</script>
