<template lang="html">
  <div class="container" style="padding-top: 2em;">
    <h1 class="is-pulled-right is-size-4 has-text-grey">
      <span class="is-hidden-mobile is-italic">
        Online CSV Validator
      </span>
    </h1>
    <b-tabs>
      <b-tab-item label="Step 1: Create Rule">
        <rule-form :rule="localRule"
          @addRule="onAddLocalRule"
          @hasUnsavedConstrait="onHasUnsavedConstrait"/>
      </b-tab-item>
      <b-tab-item label="Step 2: Validate CSV" :disabled="!localRule">
        <validator v-if="localRule"
          :rule="localRule"
          :hasUnsavedConstrait="hasUnsavedConstrait" />
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import RuleForm from '@/components/RuleForm'
import Validator from '@/components/Validator'

const defaultRule = {
  'title': 'my first validation rule',
  'settings': {
    'delimiter': ',',
    'encoding': 'utf-8',
    'hasHeader': true,
    'removeBlankRows': true,
    'autoDetectLineTerminator': true
  },
  'validations': {
    '1': {
      'required': true,
      'contains': 'csvlint.com'
    }
  }
}

export default {
  name: 'OnlineValidator',
  components: {
    RuleForm,
    Validator
  },
  data () {
    return {
      localRule: null,
      hasUnsavedConstrait: false
    }
  },
  created () {
    if (!this.$ls.get('localRule')) {
      this.$ls.set('localRule', defaultRule)
    }
    this.localRule = this.$ls.get('localRule')
  },
  methods: {
    onAddLocalRule (rule) {
      this.localRule = rule
      this.$ls.set('localRule', rule)
      this.$toast.open({
        message: 'Congrats! Validation rule saved, go to the other tab and start validating!',
        type: 'is-success',
        duration: 3000
      })
    },
    onHasUnsavedConstrait (hasIt) {
      this.hasUnsavedConstrait = hasIt
    }
  }
}
</script>

<style lang="scss">
.tab-content {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
