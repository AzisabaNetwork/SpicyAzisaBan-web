<template>
  <tr :style="style" style="cursor: pointer;" @click="redirectTo(`/players?uuid=${uuid}`)">
    <td>
      <div style="display: flex; align-items: center;">
        <span>{{ name }}</span>
        <a :href="buildSearchURL(name)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </a>
      </div>
    </td>
    <td>
      <div style="display: flex; align-items: center;">
        <span>{{ uuid }}</span>
        <a :href="buildSearchURL(uuid)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </a>
      </div>
    </td>
    <td>
      <div style="display: flex; align-items: center;">
        <span>{{ ip }}</span>
        <a :href="buildSearchURL(ip)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </a>
      </div>
    </td>
    <td>{{ toDateStringMaybe(lastLogin) }}</td>
  </tr>
</template>

<script lang="ts">
import MdIcon from '@/components/MdIcon.vue'
import { buildSearchURL, search, toDateStringMaybe } from '@/util/util'

export default {
  components: { MdIcon },
  props: {
    name: String,
    uuid: String,
    lastLogin: Number,
    ip: String,
    style: Object,
  },
  methods: {
    buildSearchURL,
    search,
    toDateStringMaybe,
    redirectTo(url: string) {
      location.href = url
    },
  },
}
</script>
