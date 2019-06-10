<template lang="html">
  <sui-table unstackable>
    <sui-table-header>
      <sui-table-row>
        <sui-table-headerCell colspan="2">{{ title }}</sui-table-headerCell>
      </sui-table-row>
    </sui-table-header>
    <sui-table-body>
      <sui-table-row v-for="name in fields">
        <sui-table-cell>
          <sui-label>{{ name }}</sui-label>
        </sui-table-cell>
        <sui-table-cell>{{ name in data ? data[name] : '' }}</sui-table-cell>
      </sui-table-row>
    </sui-table-body>
  </sui-table>
</template>

<script>
export default {
  name: 'TableDisplay',
  props: {
    title: String,
    data: Object,
    fields: Array
  }
}
</script>
