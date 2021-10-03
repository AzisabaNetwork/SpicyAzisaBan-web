<template>
  <tr :style="style">
    <td>{{ name }}</td>
    <td>{{ uuid }}</td>
    <td>{{ (new Date(lastSeen)).toLocaleString('ja-JP') }}</td>
  </tr>
</template>

<script lang="ts">
export default {
  props: {
    name: String,
    uuid: String,
    lastSeen: Number,
    style: Object,
  },
}
</script>
