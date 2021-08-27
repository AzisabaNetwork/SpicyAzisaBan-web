<template>
  <a class='dropdown-trigger' :data-target="target">{{ text }}</a>
</template>

<script lang="ts">
export default {
  props: {
    text: String,
    target: String,
  },
  setup() {
    setTimeout(() => {
      // @ts-expect-error
      M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), { // eslint-disable-line no-undef
        coverTrigger: false,
        hover: true,
      })
    }, 150)
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
  border-radius: 0 0 20px 20px;
}

.dropdown-content li>a, .dropdown-content li>span {
  color: #2ec7b9;
}

.dropdown-content li:hover, .dropdown-content li.active {
  background-color: #52585a;
}
</style>
