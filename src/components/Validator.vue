<template lang="html">
  <div class="validator">
    <section class="info-tiles">
      <div class="tile is-ancestor has-text-centered">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">
              <span>{{ constraintsCount }}</span>
              <i class="mdi mdi-open-in-new has-text-grey"
                id="rule"
                @click="openQuickView('rules')"></i>
            </p>
            <p class="subtitle stats-desc">Number of Constraints</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">
              {{ processedCount }}
              <span class="has-text-grey is-size-6"> / </span>
              {{ Object.keys(files).length || 0 }}
            </p>
            <p class="subtitle stats-desc">Processed / Total Files</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">
              {{ currentStats.progress }}<span class="has-text-grey is-size-6">%</span>
            </p>
            <p class="subtitle stats-desc">Current File Progress</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">
              <span :class="[errorsCount > 0 ? 'has-text-danger' : 'has-text-success']">
                {{ errorsCount }}
              </span>
            </p>
            <p class="subtitle stats-desc">Total Errors Detected</p>
          </article>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <p class="title">{{ currentStats.rowsCount }}</p>
            <p class="subtitle stats-desc">Current File Rows</p>
          </article>
        </div>
      </div>
    </section>
    <quick-view :active.sync="showQuickView"
      :content="quickViewContent">
    </quick-view>
    <csv-loader
      :encoding="encoding"
      v-on:startValidate="onStartValidate">
    </csv-loader>
    <hr>
    <errors-table :errors="errorsObject" />
  </div>
</template>

<script>
import CsvLoader from '@/components/CsvLoader'
import QuickView from '@/components/QuickView'
import ErrorsTable from '@/components/ErrorsTable'
import Validator from '@/core/validator'
import values from 'lodash/values'
import { OFFSET } from '@/constant'
import { getColLabel, readPartialFile } from '@/core/helper'

export default {
  name: 'Workspace',
  components: {
    CsvLoader,
    QuickView,
    ErrorsTable
  },
  props: {
    rule: {
      type: Object,
      required: true
    },
    hasUnsavedConstrait: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      files: {},
      currentFile: '',
      dataBeingProcessed: null,
      showQuickView: false,
      quickViewContent: {}
    }
  },
  watch: {
    '$route' (to, from) {
      this.showQuickView = false
    }
  },
  computed: {
    encoding () {
      if (!this.rule || !this.rule.settings) return ''
      return this.rule.settings.encoding
    },
    currentStats () {
      return this.files[this.currentFile] || {
        rowsCount: 0,
        progress: 0
      }
    },
    errorsObject () {
      return Object.keys(this.files).reduce((output, name) => {
        if (!output[name]) output[name] = []
        output[name] = this.files[name].errors
        return output
      }, {})
    },
    constraintsCount () {
      if (!this.rule || !this.rule.validations) return 0
      return values(this.rule.validations).length
    },
    processedCount () {
      return Object.keys(this.files).reduce((sum, name) => {
        if (this.files[name].name) {
          sum += 1
        }
        return sum
      }, 0)
    },
    errorsCount () {
      return Object.keys(this.files).reduce((sum, name) => {
        sum += this.files[name].errorsCount
        return sum
      }, 0)
    },
    humanReadableRules () {
      const constraints = Object.keys(this.rule.validations).reduce((output, col) => {
        const colName = `Column ${getColLabel(col)} (${col})`
        if (!output[colName]) output[colName] = {}
        if (!this.rule || !this.rule.validations) return output
        output[colName] = this.rule.validations[col]
        return output
      }, {})
      return {
        settings: this.rule.settings,
        constraints
      }
    }
  },
  methods: {
    async onStartValidate (files) {
      if (this.hasUnsavedConstrait) {
        this.$toast.open({
          message: 'You have some unsaved constraints, please go back and have them saved first.',
          type: 'is-warning',
          duration: 3000
        })
        return
      }
      this.files = files.reduce((output, file) => {
        output[encodeURIComponent(file.name)] = {
          name: file.name,
          size: file.size,
          progress: 0,
          header: [],
          errorsCount: 0,
          errors: [],
          rowsCount: 0
        }
        return output
      }, {})
      for (let file of files) {
        let start = 0
        let end = OFFSET
        this.currentFile = encodeURIComponent(file.name)
        let result = await readPartialFile(file, this.encoding, start, end)
        this.validate(result.data, end)
        while (!result.finished) {
          start = result.end
          end = result.end + OFFSET
          result = await readPartialFile(file, this.encoding, start, end)
          this.validate(result.data, end)
        }
      }
    },
    validate (data, endBytes) {
      const stats = this.files[this.currentFile]
      const rule = JSON.parse(JSON.stringify(this.rule))
      const initialLoad = stats.rowsCount === 0
      if (!initialLoad) {
        // NOTE: data in sequential load shall have no header
        rule.settings.hasHeader = false
      }
      const results = new Validator(data, rule, stats.rowsCount).process()
      this.dataBeingProcessed = results.rows

      if (initialLoad && rule.settings.hasHeader) {
        stats.header = results.header
      }
      if (initialLoad && !rule.settings.hasHeader) {
        stats.header = new Array(results.rows[0].length)
      }
      stats.progress = endBytes > stats.size
        ? 100
        : Math.round(endBytes / stats.size * 100)
      stats.errorsCount += results.errors.length
      stats.errors = stats.errors.concat(results.errors)
      stats.rowsCount += results.rows.length
    },
    openQuickView (contentType) {
      const contents = {
        errors: {
          title: 'Error Details',
          messages: this.errosObjects
        },
        rules: {
          title: 'Rule Details',
          messages: this.humanReadableRules
        }
      }
      this.quickViewContent = contents[contentType]
      this.showQuickView = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../buefy-custom.scss";
.info-tiles {
  margin: 1rem 0;
}
.info-tiles .subtitle {
  font-weight: 300;
  color: black;
}
.info-tiles .tile .title {
  font-size: 1.65rem;
  position: relative;
  i {
    position: absolute;
    top: -.25em;
    font-size: .5em;
    &:hover {
      cursor: pointer;
    }
  }
}
.stats-desc {
  padding-top: 5px;
  font-size: 1rem;
  font-style: italic;
  color: $grey-light !important;
}
</style>
