<template>
  <a :href="href" rel="noopener" :target="openNewTab ? '_blank' : null">{{ text }}</a>
</template>

<script>
module.exports = {
  props: {
    href: String,
    text: String,
    openNewTab: Boolean,
  }
}
</script>
