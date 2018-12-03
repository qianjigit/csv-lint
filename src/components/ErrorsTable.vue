<template lang="html">
  <section>
    <table class="table is-bordered is-striped is-hoverable is-fullwidth"
      v-for="(details, file) in errors" :key="file">
      <thead v-if="details.length > 0">
        <th>Row</th>
        <th>Column</th>
        <th>What's My Data?</th>
        <th>What's Wrong With It?</th>
      </thead>
      <tbody>
        <tr v-for="(detail, idx) in getTailDetails(details)" :key="idx">
          <td>{{ detail.row }}</td>
          <td>{{ detail.column }}</td>
          <td>{{ detail.content }}</td>
          <td>{{ detail.error }}</td>
        </tr>
      </tbody>
      <tfoot class="has-text-centered">
        <tr>
          <th colspan="4" class="has-text-right">
            <span>{{ file }}</span>
            <i class="mdi mdi-chevron-double-right has-text-grey-lighter"></i>
            <span class="has-text-grey has-text-weight-light"
              v-if="details.length">
              <span class="has-text-danger">{{ details.length }}</span> errors detected,
              click<a @click="downloadAll(file, details)"> here </a>
              to download error details
            </span>
            <span class="has-text-success has-text-weight-light"
              v-else>
              Congrats, all good!
            </span>
            <br>
          </th>
        </tr>
      </tfoot>
    </table>
  </section>
</template>

<script>
import { createBlobFromArray, download } from '@/utils/downloadCSV'

export default {
  name: 'ErrorsPanel',
  props: {
    errors: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      rowsLimit: 10
    }
  },
  methods: {
    getHeadDetails (details) {
      return details.slice(0, this.rowsLimit)
    },
    getTailDetails (details) {
      return details.slice(-this.rowsLimit)
    },
    downloadAll (file, details) {
      const errors = details
      const fileName = `csvlint_dot_com_validation_result_${file}`
      const blob = createBlobFromArray(['row', 'column', 'content', 'error'], errors)
      download(fileName, blob)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
