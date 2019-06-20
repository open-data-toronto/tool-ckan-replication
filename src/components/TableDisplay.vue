<template lang="html">
  <sui-table unstackable>
    <sui-table-header>
      <sui-table-row>
        <sui-table-headerCell :colspan="2">{{ title }}</sui-table-headerCell>
      </sui-table-row>
    </sui-table-header>
    <sui-table-body>
      <sui-table-row v-for="(value, key) in content" :key="key" v-show="key !== 'id' && key !== 'url'">
        <sui-table-cell>
          <sui-label>{{ key }}</sui-label>
        </sui-table-cell>
        <sui-table-cell>
          {{ value }}
        </sui-table-cell>
      </sui-table-row>
    </sui-table-body>
  </sui-table>
</template>

<script>
export default {
  name: 'TableDisplay',
  props: {
    title: String,
    content: Object
  }
}
</script>
