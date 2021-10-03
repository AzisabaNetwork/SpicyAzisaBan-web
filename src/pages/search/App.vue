<template>
  <Navbar
      :dismissible-login-modal="true"
      :default-search-word="getSearchWord()"
      @search-input="handleSearchInputEvent"
  />
  <Container>
    <ul style="display: inline-flex; align-items: center;">
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
    <Dummy v-if="isSelected('players')">
      <h2>プレイヤー ({{ result.players.length }})</h2>
      <PlayerEntriesList>
        <PlayerEntry
            v-for="p in result.players"
            :key="p.uuid"
            :name="p.name"
            :uuid="p.uuid"
            :last-seen="p.last_seen"
            :style="{ 'background-color': p.exactMatch ? 'rgba(0, 255, 0, 0.2)' : null }"
        />
      </PlayerEntriesList>
    </Dummy>
    <Dummy v-if="isSelected('punishments')">
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
            @click="redirectTo(p.id)"
        />
      </PunishmentEntriesList>
    </Dummy>
  </Container>
</template>

<script lang="ts">
import Navbar from '@/components/Navbar.vue'
import Container from '@/components/Container.vue'
import { api, toast } from '@/util/util'
import PunishmentEntriesList from '@/components/PunishmentEntriesList.vue'
import PunishmentEntry from '@/components/PunishmentEntry.vue'
import { ref } from 'vue'
import PlayerEntriesList from '@/components/PlayerEntriesList.vue'
import PlayerEntry from '@/components/PlayerEntry.vue'
import Dummy from '@/components/Dummy.vue'
import MdIcon from '@/components/MdIcon.vue'

const result = ref({
  players: [],
  punishments: [],
})

function processResult(query: string, res: { players: any[], punishments: any[] }) {
  const lq = query.toLowerCase()
  if (res.players) {
    res.players = [
      ...res.players.filter(p => p.name.toLowerCase() === lq || p.uuid.toLowerCase() === lq).map(p => {
        p.exactMatch = true
        return p
      }),
      ...res.players.filter(p => p.name.toLowerCase() !== lq && p.uuid.toLowerCase() !== lq),
    ]
  }
  console.log(res)
  result.value = res
}

const searchType = ref([ 'players', 'punishments' ])
let previousSearchTimeout = 0

function searchDebounced() {
  if (previousSearchTimeout) clearTimeout(previousSearchTimeout)
  previousSearchTimeout = setTimeout(() => search(), 250)
}

function search() {
  const params = new URLSearchParams(window.location.search)
  const query = params.get('q')
  readSearchType()
  if (!query) {
    processResult('', { players: [], punishments: [] })
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
  }).then(res => res.json()).then(res => {
    const err = res['error']
    if (err) {
      toast('検索に失敗しました: ' + err)
      return
    }
    processResult(query, res)
  })
}

function readSearchType() {
  const params = new URLSearchParams(window.location.search)
  const types = params.get('types')?.split(',')
  if (!types) return
  if (types.length === 1 && types[0] === '') {
    searchType.value = []
  } else {
    searchType.value = types
  }
}

export default {
  components: {
    MdIcon,
    Dummy,
    PlayerEntry,
    PlayerEntriesList,
    PunishmentEntry,
    PunishmentEntriesList,
    Container,
    Navbar,
  },
  data() {
    return {
      result,
    }
  },
  methods: {
    isSelected(type: string) {
      return searchType.value.includes(type)
    },
    toggleSearchType(type: string) {
      if (searchType.value.includes(type)) {
        searchType.value = searchType.value.filter(s => s !== type)
      } else {
        searchType.value.push(type)
      }
      history.replaceState({}, document.title, `${location.origin}/search?q=${encodeURI((document.getElementById('search') as HTMLInputElement).value || '')}&types=${this.searchType.join(',')}`)
      search()
    },
    getSearchWord() {
      const params = new URLSearchParams(window.location.search)
      return params.get('q')
    },
    redirectTo(id: number) {
      location.href = `/punishments/view?id=${id}`
    },
    handleSearchInputEvent(event) {
      history.replaceState({}, document.title, `${location.origin}/search?q=${encodeURI(event.target.value || '')}&types=${this.searchType.join(',')}`)
      searchDebounced()
    },
    search,
  },
  setup() {
    search()
    readSearchType()
    return {
      searchType,
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

<style scoped>
.type-icon {
  cursor: pointer;
  padding: 6px;
  transform: scale(1.5);
  margin-left: 15px;
  margin-right: 15px;
}
</style>
