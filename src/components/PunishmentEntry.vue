<template>
  <tr :class="[unpunished ? 'unpunished' : null]">
    <td>#{{ id }}</td>
    <td><PunishmentType :type="type" /></td>
    <td>{{ target }}</td>
    <td>{{ reason }}</td>
    <td><Time :time="duration" /></td>
    <td>{{ server }}</td>
    <td>
      <Link color="teal-but-green" :href="'/punishments/view/' + id"><MdIcon classes="right" style="transform: scale(1.2); padding-right: 15px;" icon="article" /></Link>
      <Link color="teal-but-green" :href="`/punishments/view/${id}?edit`"><MdIcon classes="right" icon="edit" /></Link>
    </td>
  </tr>
</template>

<script lang="ts">
import Link from "@/components/Link.vue"
import MdIcon from "@/components/MdIcon.vue"
import PunishmentType from '@/components/PunishmentType.vue'
import Time from '@/components/Time.vue'

export default {
  components: {
    Time,
    PunishmentType,
    MdIcon,
    Link,
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
