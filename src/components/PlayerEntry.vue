<template>
  <tr :style="style">
    <td>
      <div style="display: flex; align-items: center;">
        <span>{{ name }}</span>
        <span @click="search(name)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </span>
      </div>
    </td>
    <td>
      <div style="display: flex; align-items: center;">
        <span>{{ uuid }}</span>
        <span @click="search(uuid)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </span>
      </div>
    </td>
    <td>
      <div style="display: flex; align-items: center;">
        <span>{{ ip }}</span>
        <span @click="search(ip)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </span>
      </div>
    </td>
    <td>{{ (new Date(lastSeen)).toLocaleString('ja-JP') }}</td>
  </tr>
</template>

<script lang="ts">
import MdIcon from '@/components/MdIcon.vue'
import { search } from '@/util/util'

export default {
  components: { MdIcon },
  props: {
    name: String,
    uuid: String,
    lastSeen: Number,
    ip: String,
    style: Object,
  },
  methods: {
    search,
  },
}
</script>
