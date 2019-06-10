<template>
  <sui-message negative v-show="show">
    <sui-message-header>{{ title }}</sui-message-header>
    <p>{{ message }}</i></p>
  </sui-message>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    title: String,
    message: String,
    show: Boolean
  }
}
</script>
