<template>
  <a :href="href" rel="noopener">{{ text }}</a>
</template>

<script>
module.exports = {
  props: {
    href: String,
    text: String,
  }
}
</script>
