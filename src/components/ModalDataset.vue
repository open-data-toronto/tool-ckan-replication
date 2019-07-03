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
      v-bind:closable="false"
      v-if="content.dataset !== undefined">
      <sui-dimmer :active="dim">
        <sui-loader>{{ progress }}</sui-loader>
      </sui-dimmer>
      <sui-modal-header>
        {{ title }}
      </sui-modal-header>
      <sui-modal-content scrolling>
        <sui-modal-description>
          <TableDisplay
            :title="content.dataset.title"
            :content="content.dataset"/>
          <TableDisplay
            v-for="resource in content.resources"
            :title="resource.name"
            :key="resource.name"
            :content="resource"/>
        </sui-modal-description>
      </sui-modal-content>
      <sui-modal-actions>
        <sui-button type="button" negative @click="$emit('toggle')">
          Cancel
        </sui-button>
        <sui-button type="button" primary @click="$emit('submit')">
          {{ action }}
        </sui-button>
      </sui-modal-actions>
    </sui-modal>
  </div>
</template>

<script>
import TableDisplay from '@/components/TableDisplay.vue'

export default {
  name: 'TheModal',
  components: {
    TableDisplay
  },
  computed: {
    action: function () {
<<<<<<< HEAD
      return title === 'New Dataset' ? 'Create Dataset' : 'Update Dataset'
=======
      return this.title.startsWith('New') ? 'Create Dataset' : 'Update Dataset'
>>>>>>> 0790fe707ffb4962409e1ed81e4fa31e8b9f7f3c
    }
  },
  props: {
    title: String,
    content: Object,
    progress: String,
    dim: Boolean,
    open: Boolean
  }
}
</script>
