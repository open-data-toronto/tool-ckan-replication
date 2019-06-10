<template lang="html">
  <div>
    <sui-button basic
      type="button"
      content="Show Data"
      icon="right arrow"
      label-position="right"
      @click="$emit('toggle')"/>
    <sui-modal v-model="open">
      <sui-modal-header>{{ data !== null ? data.title : '' }}</sui-modal-header>
      <sui-modal-content scrolling>
        <sui-modal-description>
          <sui-table celled>
            <sui-table-header>
              <sui-table-row>
                <sui-table-header-cell>Field</sui-table-header-cell>
                <sui-table-header-cell>Value</sui-table-header-cell>
              </sui-table-row>
            </sui-table-header>
            <sui-table-body>
              <sui-table-row v-for="(value, name) in data">
                <sui-table-cell>
                  <sui-label>{{ name }}</sui-label>
                </sui-table-cell>
                <sui-table-cell>{{ value }}</sui-table-cell>
              </sui-table-row>
            </sui-table-body>
          </sui-table>
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
export default {
  name: 'ModalExample',
  props: {
    data: Object,
    open: Boolean
  }
}
</script>
