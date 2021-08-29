<template>
  {{ unProcessTime3(time) }}
</template>

<script lang="ts">
import { unProcessTime3 } from '@/util/util'

export default {
  methods: {
    unProcessTime3,
  },
  props: {
    time: Number,
  },
}
</script>
