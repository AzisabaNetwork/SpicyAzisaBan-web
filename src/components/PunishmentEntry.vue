<template>
  <tr :class="[unpunished ? 'unpunished' : null]">
    <td>#{{ id }}</td>
    <td><PunishmentType :type="type" /></td>
    <td>{{ target }}</td>
    <td style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" :title="reason">{{ reason }}</td>
    <td><NumberToTime :time="duration" /></td>
    <td>{{ server }}</td>
    <td>
      <SLink color="teal-but-green" :href="`/punishments/view/?id=${id}`">
        <MdIcon classes="right clickable-icon" style="transform: scale(1.15); margin-right: 15px; padding: 3px; margin-left: 0;" icon="article" />
      </SLink>
      <SLink color="teal-but-green" :href="`/punishments/view/?id=${id}&edit`">
        <MdIcon classes="right clickable-icon" style="padding: 3px; margin-left: 0;" icon="edit" />
      </SLink>
    </td>
  </tr>
</template>

<script lang="ts">
import SLink from "@/components/SLink.vue"
import MdIcon from "@/components/MdIcon.vue"
import PunishmentType from '@/components/PunishmentType.vue'
import NumberToTime from '@/components/NumberToTime.vue'

export default {
  components: {
    NumberToTime,
    PunishmentType,
    MdIcon,
    SLink,
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
