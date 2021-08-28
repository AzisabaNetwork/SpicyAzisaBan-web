<template>
  {{ translateType(type) }}
</template>

<script lang="ts">
export default {
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
  },
  props: {
    type: String,
  },
}
</script>
