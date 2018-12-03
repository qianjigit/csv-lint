<template lang="html">
  <div class="rule-form">
    <div class="box m-t-md">
      <section>
        <p class="is-section-break">
          <label class="label m-b-sm">Title</label>
        </p>
        <p class="control">
          <input class="input" type="text" placeholder="Give your rule a title"
            :class="[title ? 'is-success' : 'is-danger']"
            v-model="title"
            @keydown.enter.prevent=""
            autofocus required>
        </p>
      </section>

      <section class="m-t-lg">
        <p class="is-section-break">
          <label class="label">File Settings</label>
        </p>
        <div class="columns content">
          <div class="column is-one-third">
            <p>Field Delimiter</p>
            <div class="control">
              <label class="radio">
                <input type="radio" value="," v-model="settings.delimiter">
                Comma
              </label>
              <label class="radio">
                <input type="radio" value=";" v-model="settings.delimiter">
                Semicolon
              </label>
              <label class="radio">
                <input type="radio" value="\t" v-model="settings.delimiter">
                Tab
              </label>
            </div>
          </div>
          <div class="column is-one-third">
            <p>
              Encoding
              <a href="mailto:csvlint.service@gmail.com?subject=Hi" target="_blank"
                class="is-size-7 is-italic">
                request more encodings
              </a>
            </p>
            <div class="control">
              <label class="radio">
                <input type="radio" value="utf-8" v-model="settings.encoding">
                UTF-8
              </label>
              <label class="radio">
                <input type="radio" value="iso-8859-1" v-model="settings.encoding">
                ISO-8859-1
              </label>
            </div>
          </div>
        </div>
        <div class="columns content">
          <div class="column is-one-third">
            <p>Has Header</p>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="settings.hasHeader">
                Yes
              </label>
            </div>
          </div>
          <div class="column is-one-third">
            <p>Auto-detect Line Terminator</p>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="settings.autoDetectLineTerminator" disabled>
                Yes
              </label>
            </div>
          </div>
          <div class="column is-one-third">
            <p>Skip Blank Rows</p>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="settings.removeBlankRows" disabled>
                Yes
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="m-t-lg">
        <p class="is-section-break is-clearfix">
          <label class="label is-pulled-left">Constraints</label>
          <span class="help is-pulled-right is-italic" v-if="Object.keys(validations).length">
            <span class="has-text-danger">♥</span> don't worry, the empty constraints will be removed automatically upon saving :)
          </span>
        </p>
        <!-- validations -->
        <fieldset v-for="(constraints, column, index) in validations" :key="index">
          <legend>Column
            <select class="select has-no-border" v-model="column"
              @change="onAfterColumnChange"
              @focus="onBeforeColumnChange">
              <option v-for="(col, idx) in COLUMNS" :key="idx" :value="col">
                {{ getColLabel(col) }} / {{ col }}
              </option>
            </select>
            <a @click="removeColumn(column)" class="has-text-danger">
              <i class="mdi mdi-delete"></i>
            </a>
          </legend>
          <!-- constraints -->
          <div class="field has-addons" v-for="(value, constraint) in constraints" :key="constraint">
            <p class="control">
              <a class="button is-static">{{ constraint }}</a>
            </p>
            <div class="select" v-if="constraint === 'required'">
              <select v-model="constraints.required">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <input class="input" v-else
              type="text"
              v-model="constraints[constraint]">
            <p class="control" v-if="constraint !== 'required'">
              <a class="button is-default is-delete" @click="removeConstraint(column, constraint)">
                <i class="mdi mdi-delete"></i>
              </a>
            </p>
          </div>
          <a id="show-all-constraints" class="is-size-7 is-italic"
            v-if="Object.keys(constraints).length < NUM_OF_CONSTRAINTS"
            @click="showAllConstraints(column)">Show All Constraints</a>
        </fieldset>
      </section>
      <div class="has-text-centered m-t-md">
        <a @click="addColumn()">
          <i class="mdi mdi-plus-circle mdi-24px"></i>
        </a>
      </div>
      <hr>
      <p class="has-text-centered">
        <button type="submit"
          class="button is-dark is-fullwidth"
          @click="change"
          :disabled="!canChange">
          Save
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { getColLabel } from '@/core/helper'
import { DEFAULT_OPTIONS } from '@/constant'

const COLUMNS = Array.apply(null, Array(100)).map((x, i) => i + 1)
const CONSTRAINTS = {
  required: true,
  greaterThan: '',
  lessThan: '',
  equalsTo: '',
  minLength: '',
  maxLength: '',
  contains: ''
  // pattern: '' // TODO
}
const NUM_OF_CONSTRAINTS = Object.keys(CONSTRAINTS).length

export default {
  name: 'RuleForm',
  props: {
    rule: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      title: '',
      validations: {},
      settings: {
        delimiter: DEFAULT_OPTIONS.defaultDelimiter,
        encoding: DEFAULT_OPTIONS.defaultEncoding,
        hasHeader: true,
        removeBlankRows: true,
        autoDetectLineTerminator: true
      },
      columns: Array.apply(null, Array(100)).map((x, i) => i + 1),
      previousColumn: '',
      getColLabel,
      COLUMNS,
      NUM_OF_CONSTRAINTS
    }
  },
  computed: {
    canChange () {
      return this.title && Object.keys(this.validations).length > 0
    },
    isEditMode () {
      return !!this.$route.query.id
    },
    ruleColumns () {
      if (!this.rule) return []
      return Object.keys(this.rule.validations)
    }
  },
  created () {
    if (this.rule) {
      this.title = this.rule.title
      this.validations = this.rule.validations
      this.settings = this.rule.settings
    }
  },
  methods: {
    async change () {
      if (!this.canChange) { return }
      const rule = {
        title: this.title,
        settings: this.settings,
        validations: this.removeEmptyConstraints(this.validations)
      }
      this.$emit('hasUnsavedConstrait', false)
      if (this.isEditMode) {
        this.$emit('updateRule', rule)
      } else {
        this.$emit('addRule', rule)
      }
    },
    addColumn () {
      if (this.rule) {
        this.columns = this.columns
          .filter(col => !this.ruleColumns.includes(String(col)))
      }
      const column = this.columns.shift()
      this.$emit('hasUnsavedConstrait', true)
      this.$set(this.validations, column, JSON.parse(JSON.stringify(CONSTRAINTS)))
    },
    removeColumn (column) {
      this.columns.unshift(column)
      this.$delete(this.validations, column)
    },
    removeConstraint (column, constraint) {
      this.$delete(this.validations[column], constraint)
    },
    removeEmptyConstraints (validations) {
      return Object.keys(validations)
        .reduce((output, col) => {
          output[col] = Object.keys(validations[col])
            .reduce((uniq, constraint) => {
              if (validations[col][constraint]) {
                uniq[constraint] = validations[col][constraint]
              }
              return uniq
            }, {})
          return output
        }, {})
    },
    onBeforeColumnChange (evt) {
      this.previousColumn = evt.target.value
    },
    onAfterColumnChange (evt) {
      this.$set(this.validations, evt.target.value, this.validations[this.previousColumn])
      this.$delete(this.validations, this.previousColumn)
      this.previousColumn = ''
    },
    showAllConstraints (column) {
      const filledConstraints = Object.assign({}, CONSTRAINTS, this.validations[column])
      this.$set(this.validations, column, filledConstraints)
    }
  }
}
</script>

<style lang="scss" scoped>
fieldset {
  position: relative;
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;

  #show-all-constraints {
    position: absolute;
    right: 5px;
    bottom: 5px;
  }
}
legend {
  padding: 0 10px;
  text-align: right;
}
.has-no-border {
  border: none;
}
.field.has-addons {
  float: left;
  margin-right: 15px;
}
.is-delete {
  color: #eee;
  &:hover {
    color: red;
  }
}
.is-prop {
  background: #f5f5f5;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
.is-section-break {
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
  // padding-bottom: 5px;
}
.is-narrow {
  width: 7em;
}
</style>
