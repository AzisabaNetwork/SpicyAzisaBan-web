<script setup lang="ts">
import {ref} from "vue";
import {api, toast} from "@/util/util";

let previousSearchTimeout = 0

function searchDebounced() {
  if (previousSearchTimeout) clearTimeout(previousSearchTimeout)
  previousSearchTimeout = setTimeout(() => search(), 250)
}
const result = ref({
  users: [],
  players: [],
  punishments: [],
})

function processResult(query: string, res: { users: any[], players: any[], punishments: any[] }) {
  const lq = query.toLowerCase()
  res.users = [
    ...res.users.filter(p => p.username.toLowerCase() === lq || p.email.toLowerCase() === lq).map(p => {
      p.exactMatch = true
      return p
    }),
    ...res.users.filter(p => p.username.toLowerCase() !== lq && p.email.toLowerCase() !== lq),
  ]
  res.players = [
    ...res.players.filter(p => p.name.toLowerCase() === lq || p.uuid.toLowerCase() === lq).map(p => {
      p.exactMatch = true
      return p
    }),
    ...res.players.filter(p => p.name.toLowerCase() !== lq && p.uuid.toLowerCase() !== lq),
  ]
  console.log(res)
  result.value = res
}

function search() {
  const params = new URLSearchParams(window.location.search)
  const query = params.get('q')
  readSearchType()
  if (!query) {
    processResult('', { users: [], players: [], punishments: [] })
    return
  }
  console.log(searchType.value)
  fetch(api('/misc/search'), {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
    },
    body: JSON.stringify({
      query,
      type: searchType.value.join(','),
    }),
    credentials: 'include',
  }).then(res => res.json()).then(res => {
    const err = res['error']
    if (err) {
      toast('検索に失敗しました: ' + err)
      return
    }
    processResult(query, res)
  })
}

function handleSearchInputEvent(event: any) {
  history.replaceState({}, document.title, `${location.origin}/search?q=${queryToURL(event.target.value || '')}&types=${searchType.value.join(',')}`)
  searchDebounced()
}

function toggleSearchType(type: string) {
  if (searchType.value.includes(type)) {
    searchType.value = searchType.value.filter(s => s !== type)
  } else {
    searchType.value.push(type)
  }
  history.replaceState({}, document.title, `${location.origin}/search?q=${queryToURL((document.getElementById('search') as HTMLInputElement).value || '')}&types=${searchType.value.join(',')}`)
  search()
}

search()
readSearchType()
</script>

<template>
  <Navbar
      :dismissible-login-modal="true"
      :default-search-word="getSearchWord()"
      @search-input="handleSearchInputEvent"
      @me-updated="onMeUpdated"
  />
  <Container>
    <ul style="display: inline-flex; align-items: center;">
      <li v-if="group === 'admin'">
        <MdIcon
            icon="badge"
            classes="clickable-icon type-icon"
            :style="{ 'background-color': isSelected('users') ? 'rgba(0, 255, 0, 0.3)' : null }"
            @click="toggleSearchType('users')"
        />
      </li>
      <li>
        <MdIcon
            icon="person"
            classes="clickable-icon type-icon"
            :style="{ 'background-color': isSelected('players') ? 'rgba(0, 255, 0, 0.3)' : null }"
            @click="toggleSearchType('players')"
        />
      </li>
      <li>
        <MdIcon
            icon="block"
            classes="clickable-icon type-icon"
            :style="{ 'background-color': isSelected('punishments') ? 'rgba(0, 255, 0, 0.3)' : null }"
            @click="toggleSearchType('punishments')"
        />
      </li>
    </ul>
    <template v-if="group === 'admin' && isSelected('users')">
      <h2>ユーザー ({{ result.users.length }})</h2>
      <UserEntriesList>
        <UserEntry
            v-for="p in result.users"
            :key="p.id"
            :id="p.id"
            :username="p.username"
            :email="p.email"
            :group="p.group"
            :style="{ 'background-color': p.exactMatch ? 'rgba(0, 255, 0, 0.2)' : null, cursor: 'pointer' }"
            @click="redirectTo(`/admin/users?id=${p.id}`)"
        />
      </UserEntriesList>
    </template>
    <template v-if="isSelected('players')">
      <h2>プレイヤー ({{ result.players.length }})</h2>
      <PlayerEntriesList>
        <PlayerEntry
            v-for="p in result.players"
            :key="p.uuid"
            :name="p.name"
            :uuid="p.uuid"
            :last-login="p.last_login"
            :ip="p.ip"
            :style="{ 'background-color': p.exactMatch ? 'rgba(0, 255, 0, 0.2)' : null }"
        />
      </PlayerEntriesList>
    </template>
    <template v-if="isSelected('punishments')">
      <h2>処罰 ({{ result.punishments.length }})</h2>
      <PunishmentEntriesList>
        <PunishmentEntry
            v-for="p in result.punishments"
            :key="p.id"
            :id="p.id"
            :type="p.type"
            :target="p.name"
            :reason="p.reason"
            :duration="p.end - p.start"
            :server="p.server"
            :unpunished="p.unpunished || !p.active || (p.end > 0 && p.end < Date.now())"
            :style="{ cursor: 'pointer' }"
            @click="redirectTo(`/punishments/view?id=${p.id}`)"
        />
      </PunishmentEntriesList>
    </template>
  </Container>
</template>

<script lang="ts">
import Navbar from '@/components/NavBar.vue'
import Container from '@/components/SpicyContainer.vue'
import PunishmentEntriesList from '@/components/PunishmentEntriesList.vue'
import PunishmentEntry from '@/components/PunishmentEntry.vue'
import PlayerEntriesList from '@/components/PlayerEntriesList.vue'
import PlayerEntry from '@/components/PlayerEntry.vue'
import MdIcon from '@/components/MdIcon.vue'
import UserEntriesList from '@/components/UserEntriesList.vue'
import UserEntry from '@/components/UserEntry.vue'
import {ref as refInScript} from "vue";

const searchType = refInScript([ 'players', 'punishments' ])

function readSearchType() {
  const params = new URLSearchParams(window.location.search)
  const param = params.get('types')
  if (!param) return
  const types = param.split(',')
  if (types.length === 1 && types[0] === '') {
    searchType.value = []
  } else {
    searchType.value = types
  }
}

function queryToURL(query: string = '') {
  return encodeURI((query || '').replace('\u0009', ''))
}

export default {
  components: {
    UserEntry,
    UserEntriesList,
    MdIcon,
    PlayerEntry,
    PlayerEntriesList,
    PunishmentEntry,
    PunishmentEntriesList,
    Container,
    Navbar,
  },
  data() {
    return {
      group: 'user',
    }
  },
  methods: {
    isSelected(type: string) {
      return searchType.value.includes(type)
    },
    getSearchWord() {
      const params = new URLSearchParams(window.location.search)
      return params.get('q')
    },
    redirectTo(url: string) {
      location.href = url
    },
    onMeUpdated(me) {
      this.group = me.group
    },
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

<style scoped>
.type-icon {
  cursor: pointer;
  padding: 6px;
  transform: scale(1.5);
  margin-left: 15px;
  margin-right: 15px;
}
</style>
