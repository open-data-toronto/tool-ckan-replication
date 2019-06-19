<template lang="html">
  <sui-table unstackable>
    <sui-table-header>
      <sui-table-row>
        <sui-table-headerCell :colspan="columns">{{ title }}</sui-table-headerCell>
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
        <sui-table-cell v-show="columns === 3">
          {{ secondary[key] if columns === 3 else '' }}
        </sui-table-cell>
      </sui-table-row>
    </sui-table-body>
  </sui-table>
</template>

<script>
export default {
  name: 'TableDisplay',
  calculated: {
    columns: function () {
      return Object.keys(original).length === 0  ? 2 : 3
    }
  }
  props: {
    title: String,
    content: Object,
    original: Object
  }
}
</script>
