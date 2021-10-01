<template>
  <Navbar :dismissible-login-modal="true" />
  <Container>
    <PunishmentEntriesList>
      <PunishmentEntry
          v-for="p in punishments"
          :key="p.id"
          :id="p.id"
          :type="p.type"
          :target="p.name"
          :reason="p.reason"
          :duration="p.end - p.start"
          :server="p.server"
          :unpunished="p.unpunished || !p.active || (p.end > 0 && p.end < Date.now())"
          style="cursor: pointer"
          @click="redirectTo(p.id)"
      />
    </PunishmentEntriesList>
    <Button text="さらに取得" @click="fetchMore" :disabled="disableFetchMoreButton || !hasNext" />
  </Container>
</template>

<script lang="ts">
import { ref } from "vue"
import Navbar from '@/components/Navbar.vue'
import PunishmentEntriesList from "@/components/PunishmentEntriesList.vue"
import PunishmentEntry from "@/components/PunishmentEntry.vue"
import Container from "@/components/Container.vue"
import Button from "@/components/Button.vue"

const page = ref(0)
const punishments = ref([])
const hasNext = ref(false)
const disableFetchMoreButton = ref(false)

export default {
  components: {
    Button,
    Container,
    PunishmentEntry,
    PunishmentEntriesList,
    Navbar,
  },
  methods: {
    fetchMore() {
      if (!hasNext.value) return
      disableFetchMoreButton.value = true
      fetch(`${process.env.VUE_APP_API_URL}/punishments/list?page=${++page.value}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
      }).then(res => res.json()).then(res => {
        if (res['error']) {
          return
        }
        const data = res['data']
        console.log(res)
        hasNext.value = res['hasNext']
        punishments.value = punishments.value.concat(data)
      }).finally(() => disableFetchMoreButton.value = false)
    },
    redirectTo(id: number) {
      location.href = `/punishments/view?id=${id}`
    },
  },
  setup() {
    fetch(`${process.env.VUE_APP_API_URL}/punishments/list?page=${page.value}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
      },
    }).then(res => res.json()).then(res => {
      if (res['error']) {
        return
      }
      const data = res['data']
      console.log(res)
      hasNext.value = res['hasNext']
      punishments.value = punishments.value.concat(data)
    })
    return {
      page,
      punishments,
      hasNext,
      disableFetchMoreButton,
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
}
</style>
