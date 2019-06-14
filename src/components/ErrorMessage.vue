<template>
  <sui-grid-row centered>
    <sui-message negative>
      <sui-message-header>Errors</sui-message-header>
      <li v-for="value in errors" :key="value.key" v-show="value.show">{{ value.title }}</li>
    </sui-message>
  </sui-grid-row>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    errors: Object
  }
}
</script>
