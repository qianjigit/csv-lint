<template lang="html">
  <section>
    <div class="card">
      <header class="card-header">
        <p class="card-header-title is-italic has-text-grey has-text-weight-light">
          Get started by loading your files
        </p>
        <a href="#" class="card-header-icon" id="loader" @click="upload">
          <span class="icon">
            <i class="mdi mdi-upload mdi-24px"></i>
          </span>
        </a>
      </header>
      <div class="card-content" v-if="files.length">
        <div class="file-names">
          <span class="tag" v-for="name of fileNames" :key="name">
            {{ name }}
            <button class="delete is-small" @click="removeFileByName(name)"></button>
          </span>
        </div>
      </div>
      <div class="card-footer" v-if="files.length">
        <a class="card-footer-item" @click="startValidate">Start Validate</a>
      </div>
    </div>
    <input ref="uploadInput" type="file" accept="text/csv" multiple @change="onFilesChanged">
    <div class="is-pulled-right m-t-md m-b-md">
      <p class="is-italic has-text-grey is-size-6" v-if="!files.length">
        <a href="https://www.google.com/chrome/" target="_blank" id="chrome">Google Chrome</a> works best with our browser validation engine
      </p>
    </div>
  </section>
</template>

<script>
import { OFFSET, DEFAULT_OPTIONS } from '@/constant'

const defaultEncoding = DEFAULT_OPTIONS.defaultEncoding

export default {
  name: 'CsvLoader',
  props: {
    encoding: {
      type: String,
      default: () => defaultEncoding
    }
  },
  data () {
    return {
      files: []
    }
  },
  computed: {
    fileNames () {
      if (!this.files) return []
      return Array.from(this.files).map(file => file.name)
    }
  },
  created () {
    const isLocalReadSupported = window.File &&
      window.FileReader &&
      window.FileList &&
      window.Blob
    if (!isLocalReadSupported) {
      this.$snackbar.open({
        message: 'Sorry your browser is not supported, we highly recommend to use the latest version of Goolge Chrome for our service.',
        duration: 15 * 1000,
        type: 'is-warning',
        position: 'is-top',
        actionText: 'Get it',
        onAction: () => window.open('https://www.google.com/chrome/', '_blank')
      })
    }
  },
  methods: {
    onFilesChanged (event, start = 0, end = OFFSET, isBackward = false) {
      if (!event.target || !event.target.files) return
      for (let file of event.target.files) {
        if (this.fileNames.indexOf(file.name) >= 0) continue
        this.files.push(file)
      }
      // NOTE: otherwise loading same file the second time won't trigger change event
      event.target.value = ''
    },
    removeFileByName (name) {
      let fileIdx = null
      for (let [idx, file] of this.files.entries()) {
        if (file.name === name) {
          fileIdx = idx
          break
        }
      }
      this.files.splice(fileIdx, 1)
    },
    upload () {
      this.$refs.uploadInput.click()
    },
    startValidate () {
      this.$emit('startValidate', this.files)
    }
  }
}
</script>

<style lang="scss" scoped>
.m-t-md {
  margin-top: 15px;
}
.m-b-md {
  margin-bottom: 15px;
}
i {
  &:hover {
    cursor: pointer;
  }
}
input {
  display: none;
}
.file-names > span {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
