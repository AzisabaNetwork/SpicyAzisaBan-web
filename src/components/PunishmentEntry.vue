<template>
  <tr :class="[unpunished ? 'unpunished' : null]">
    <td>#{{ id }}</td>
    <td>{{ translateType(type) }}</td>
    <td>{{ target }}</td>
    <td>{{ reason }}</td>
    <td>{{ unProcessTime(duration) }}</td>
    <td>{{ server }}</td>
    <td>
      <Link color="teal-but-green" :href="'/punishments/view/' + id"><MdIcon classes="right" style="transform: scale(1.2); padding-right: 15px;" icon="article" /></Link>
      <Link color="teal-but-green" :href="'/punishments/edit/' + id"><MdIcon classes="right" style="opacity: 0.1;" icon="edit" /></Link>
    </td>
  </tr>
</template>

<script lang="ts">
import Link from "@/components/Link.vue"
import MdIcon from "@/components/MdIcon.vue"

export default {
  components: {
    MdIcon,
    Link,
  },
  methods: {
    translateType(type: string) {
      switch (type) {
        case 'BAN': return 'Ban'
        case 'TEMP_BAN': return 'TempBan'
        case 'IP_BAN': return 'IPBan'
        case 'TEMP_IP_BAN': return 'TempIPBan'
        case 'MUTE': return 'Mute'
        case 'TEMP_MUTE': return 'TempMute'
        case 'IP_MUTE': return 'IPMute'
        case 'TEMP_IP_MUTE': return 'TempIPMute'
        case 'WARNING': return 'Warn'
        case 'CAUTION': return 'Caution'
        case 'KICK': return 'Kick'
        case 'NOTE': return 'Note'
      }
      return type
    },
    unProcessTime(n: number) {
      if (n < 0) return '無期限'
      let time = n
      let d = 0
      let h = 0
      let m = 0
      let s = 0
      if (time > 86400000) {
        d = Math.floor(time / 86400000)
        time -= d * 86400000
      }
      if (time > 3600000) {
        h = Math.floor(time / 3600000)
        time -= h * 3600000
      }
      if (time > 60000) {
        m = Math.floor(time / 60000)
        time -= m * 60000
      }
      if (time > 1000) {
        s = Math.floor(time / 1000)
        time -= s * 1000
      }
      let str = ''
      if (d !== 0) str += `${d}日`
      if (h !== 0) str += `${h}時間`
      if (m !== 0) str += `${m}分`
      if (s !== 0 || str === '') str += `${s}秒`
      return str
    }
  },
  props: {
    id: Number,
    type: String,
    target: String,
    reason: String,
    duration: Number,
    server: String,
    unpunished: Boolean,
  },
}
</script>

<style scoped>
tr.unpunished {
  opacity: 0.3;
  transition: all 200ms;
  filter: blur(1px);
}

tr.unpunished:hover {
  opacity: 1;
  transition: all 200ms;
  filter: none;
}
</style>
