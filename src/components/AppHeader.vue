<template lang="html">
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item is-size-3 logo">
          <span class="has-text-weight-bold">
            <span class="highlight has-text-weight-bold">.</span>CSV</span>&nbsp;Lint<span></span>
        </router-link>
        <span class="navbar-burger burger"
          :class="{ 'is-active': isMenuActive }"
          @click="isMenuActive = !isMenuActive">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': isMenuActive }">
        <div class="navbar-end">
          <div class="tabs is-right">
            <a href="https://github.com/slashbit/csv-lint" target="_blank"
              class="navbar-item is-size-4">
              <i class="mdi mdi-github-circle"></i>Github
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppHeader',
  data () {
    return {
      isMenuActive: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../buefy-custom.scss";

.navbar {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
.logo > span:first-of-type {
  padding: 0 10px;
  border: 5px solid #eee;
}
.logo > span:last-of-type {
  position: relative;
  left: 5px;
  top: 20px;
}
.navbar-item:hover {
  background-color: white !important;
  color: black !important;
}
.navbar-menu i {
  margin-right: 10px;
}
.highlight {
  color: $primary;
}
</style>
