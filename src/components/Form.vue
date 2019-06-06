<template>
  <div is="sui-container">
    <sui-form>
      <sui-grid divided="vertically">
        <sui-grid-row :columns="2">
          <CKANSelection type="Source"/>
          <CKANSelection type="Target"/>
        </sui-grid-row>
        <div class="center">
          <sui-button basic type="submit" content="Next" icon="right arrow" label-position="right"/>
        </div>
      </sui-grid>
    </sui-form>
  </div>
</template>

<script>
import CKANSelection from '@/components/CKANSelection.vue'

export default {
  name: 'Form',
  components: {
    CKANSelection
  }
}
</script>

<style scoped lang="scss">
.center {
  margin: 0 auto;
}
</style>
