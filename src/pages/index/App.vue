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
          :style="{ cursor: 'pointer', 'background-color': highlight.includes(p.id) ? 'rgba(255, 255, 0, 0.2)' : null }"
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
import { api, toast } from '@/util/util'

const page = ref(0)
const punishments = ref([])
const hasNext = ref(false)
const disableFetchMoreButton = ref(false)

const highlight = ref([])

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
      fetch(api(`/punishments/list?page=${++page.value}`), {
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
    fetch(api(`/punishments/list?page=${page.value}`), {
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
      highlight,
    }
  },
  mounted() {
    const params = new URLSearchParams(location.search)
    if (params.get('error')) {
      const e = params.get('error')
      if (e === 'not_logged_in') {
        toast('エラー: ログインしてません。')
      } else if (e === 'missing_permissions') {
        toast('エラー: 権限がありません。')
      } else {
        toast('エラー: ' + e)
      }
    }
  },
}

const checkHash = () => {
  const match = location.href.match(/(.*?)#(.*)/)
  if (match && match[2]) {
    highlight.value = match[2].split(',').flatMap(s => {
      const match2 = s.match(/(\d+)-(\d+)/)
      if (match2) {
        const arr = []
        const i1 = parseInt(match2[1])
        const i2 = parseInt(match2[2])
        if (i1 <= i2) {
          for (let i = i1; i <= i2; i++) {
            arr.push(i)
          }
        } else {
          for (let i = i2; i <= i1; i++) {
            arr.push(i)
          }
        }
        return arr
      } else {
        return [ parseInt(s, 10) ]
      }
    }).filter(i => i > 0)
  }
}

checkHash()

addEventListener('hashchange', () => checkHash())
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
