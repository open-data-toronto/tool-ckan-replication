<template>
  <div is="sui-container">
    <sui-form v-on:submit.prevent="loadPackage">
      <sui-grid divided="vertically">
        <sui-grid-row :columns="2">
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Source</sui-header>
              <sui-segment attached="bottom">
                <FormDataset v-model="dataset"/>
                <FormAPIKey v-model="keys.source"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
          <sui-grid-column>
            <sui-segment basic>
              <sui-header attached="top" textAlign="center">Target</sui-header>
              <sui-segment attached="bottom">
                <FormInstance v-model="instance" @set-instance="setInstance"/>
                <FormAPIKey v-model="keys.target"/>
              </sui-segment>
            </sui-segment>
          </sui-grid-column>
        </sui-grid-row>
      </sui-grid>
      <sui-button basic
        type="submit"
        content="Next"
        icon="right arrow"
        label-position="right"/>
    </sui-form>
  </div>
</template>

<script>
import FormAPIKey from '@/components/FormAPIKey.vue'
import FormDataset from '@/components/FormDataset.vue'
import FormInstance from '@/components/FormInstance.vue'

export default {
  name: 'TheForm',
  components: {
    FormAPIKey,
    FormDataset,
    FormInstance
  },
  methods: {
    setInstance: function (val) {
      this.instance = val;
    },
    set
    loadPackage: function () {
      console.log("HELLO")
    }
  },
  data () {
    return {
      dataset: null,
      instance: 'https://ckanadmin.intra.prod-toronto.ca',
      keys: {
        source: null,
        target: null
      }
    }
  }
}
</script>
