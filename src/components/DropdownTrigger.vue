<template>
  <a class='dropdown-trigger' :data-target="target" @click="onClick()">{{ text }}</a>
</template>

<script lang="ts">
export default {
  methods: {
    onClick() {
      if (!this.$props.target) return
      setTimeout(() => {
        const el = document.getElementById(this.$props.target)
        el.style.top = '64px'
        el.style['border-radius'] = '0 0 20px 20px'
      }, 1)
    }
  },
  props: {
    text: String,
    target: String,
  },
}
</script>

<style scoped>
.dropdown-trigger {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>

<style>
.dropdown-content {
  background-color: #22282a;
}

.dropdown-content li>a, .dropdown-content li>span {
  color: #2ec7b9;
}

.dropdown-content li:hover, .dropdown-content li.active {
  background-color: #52585a;
}
</style>
