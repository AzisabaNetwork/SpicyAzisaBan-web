<template>
  {{ unProcessTime(time) }}
</template>

<script lang="ts">
export default {
  methods: {
    unProcessTime(n: number) {
      if (n < 0) return '無期限'
      let time = n
      let d = 0
      let h = 0
      let m = 0
      let s = 0
      if (time >= 86400000) {
        d = Math.floor(time / 86400000)
        time -= d * 86400000
      }
      if (time >= 3600000) {
        h = Math.floor(time / 3600000)
        time -= h * 3600000
      }
      if (time >= 60000) {
        m = Math.floor(time / 60000)
        time -= m * 60000
      }
      if (time >= 1000) {
        s = Math.floor(time / 1000)
        time -= s * 1000
      }
      let str = ''
      if (d !== 0) str += `${d}日`
      if (h !== 0) str += `${h}時間`
      if (m !== 0) str += `${m}分`
      if (s !== 0 || str === '') str += `${s}秒`
      return str
    },
  },
  props: {
    time: Number,
  },
}
</script>
