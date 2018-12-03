<template lang="html">
  <div :class="['quickview', active ? 'is-active' : '']">
    <header class="quickview-header">
      <p class="title has-text-weight-bold">{{ content.title }}</p>
      <span class="delete"
        @click="$emit('update:active', false)"></span>
    </header>
    <div class="quickview-body">
      <div class="quickview-block">
        <pre v-if="!htmlMsgs">{{ content.messages }}</pre>
        <ul v-if="htmlMsgs">
          <li v-for="(msg, idx) in content.messages" :key="idx" v-html="msg"></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickView',
  props: {
    active: {
      type: Boolean,
      default: () => false
    },
    content: {
      type: Object
    }
  },
  computed: {
    htmlMsgs () {
      return this.content.type === 'html'
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  padding: 10px 0 10px 15px;
}
ul > li {
  list-style: square inside url('data:image/gif;base64,R0lGODlhBQAKAIABAAAAAP///yH5BAEAAAEALAAAAAAFAAoAAAIIjI+ZwKwPUQEAOw==');
}
</style>
