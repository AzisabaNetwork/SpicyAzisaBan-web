<template>
  <tr :class="[unpunished ? 'unpunished' : null]">
    <td>#{{ id }}</td>
    <td><PunishmentType :type="type" /></td>
    <td>{{ target }}</td>
    <td style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" :title="reason">{{ reason }}</td>
    <td><Time :time="duration" /></td>
    <td>{{ server }}</td>
    <td>
      <Link color="teal-but-green" :href="`/punishments/view/?id=${id}`">
        <MdIcon classes="right clickable-icon" style="transform: scale(1.15); margin-right: 15px; padding: 3px; margin-left: 0;" icon="article" />
      </Link>
      <Link color="teal-but-green" :href="`/punishments/view/?id=${id}&edit`">
        <MdIcon classes="right clickable-icon" style="padding: 3px; margin-left: 0;" icon="edit" />
      </Link>
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
