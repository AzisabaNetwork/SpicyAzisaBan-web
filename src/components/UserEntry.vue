<template>
  <tr :style="style">
    <td>{{ id }}</td>
    <td>{{ username }}</td>
    <td>{{ email }}</td>
    <td>{{ group }}</td>
  </tr>
</template>

<script lang="ts">
export default {
  props: {
    id: Number,
    username: String,
    email: String,
    group: String,
    style: Object,
  },
}
</script>
