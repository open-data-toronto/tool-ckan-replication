<template lang="html">
  <div>
    <sui-button basic
      type="button"
      content="Show Data"
      icon="right arrow"
      label-position="right"
      @click="$emit('toggle')"/>
    <sui-modal
      v-model="open"
      v-bind:closable="false">
      <sui-modal-header>
        {{ content !== undefined && content.dataset !== undefined ? content.dataset.title : '' }}
      </sui-modal-header>
      <sui-modal-content scrolling>
        <sui-modal-description v-if="content !== undefined">
          <TableDisplay
            title="Organization"
            :content="content.organization"/>
          <TableDisplay
            title="Dataset"
            :content="content.dataset"/>
          <!-- TODO: Display resources correctly -->
          <TableDisplay
            title="Resource"
            v-for="resource in content.resources"
            :key="resource.name"
            :content="resource"/>
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
    content: Object,
    open: Boolean
  }
}
</script>
