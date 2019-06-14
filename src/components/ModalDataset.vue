<template lang="html">
  <div>
    <sui-button basic
      type="button"
      content="Show Data"
      icon="right arrow"
      label-position="right"
      @click="$emit('toggle')"/>
    <sui-modal v-model="open" v-bind:closable="false">
      <sui-modal-header>{{ data.dataset !== undefined ? data.dataset.title : '' }}</sui-modal-header>
      <sui-modal-content scrolling>
        <sui-modal-description v-if="data !== null">
          <TableDisplay title="Organization" :data="data.organization"/>
          <TableDisplay title="Dataset" :data="data.dataset"/>
          <TableDisplay title="Resource" v-for="resource in data.resources" :key="resource.name" :data="resource"/>
        </sui-modal-description>
      </sui-modal-content>
      <sui-modal-actions>
        <sui-button type="button" negative @click="$emit('toggle')">Cancel</sui-button>
        <sui-button type="button" primary @click="$emit('submit')">Submit</sui-button>
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
  }
}
</script>
