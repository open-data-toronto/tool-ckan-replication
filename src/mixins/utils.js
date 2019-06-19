const axios = require('axios')

export default {
  methods: {
    // convertMap() converts an array of objects to an object with a speicified
    // object field as the key
    convertMap: function(obj, key) {
      let map = {}
      for (let v of obj) {
        map[obj[key]] = v
      }

      return map
    },

    // change() checks for differences between 2 objects and terminology used
    // assuming a is the new object and b is the origin object
    findDifference: function(a, b) {
      let result = {}

      for (let [key, value] of a.entries()) {
        if (key === 'resources') {
          continue
        }

        if (!b.hasOwnProperty(key)) {
          result[key] = 'insert'
        } else if (a[key] !== b[key]) {
          result[key] = 'update'
        }
      }

      for (let [key, value] of b.entries()) {
        if (!a.hasOwnProperty(key)) {
          result[key] = 'delete'
        }
      }

      return result
    },
  }
}
