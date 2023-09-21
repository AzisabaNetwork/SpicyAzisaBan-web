<template>
  <Navbar
      :dismissible-login-modal="true"
      @me-updated="onMeUpdated"
  />
  <Container v-if="player">
    <FlippedTable>
      <FlippedTableEntry :ks="3" :vs="9" k="名前" :v="player.name" />
      <FlippedTableEntry :ks="3" :vs="9" k="UUID" :v="player.uuid" />
      <FlippedTableEntry :ks="3" :vs="9" k="最近のIPアドレス">
        <span>{{ player.ip }}</span>
        <span @click="search(player.ip)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </span>
      </FlippedTableEntry>
      <FlippedTableEntry :ks="3" :vs="9" k="最初のログイン試行" :v="toDateStringMaybe(player.first_login_attempt)" />
      <FlippedTableEntry :ks="3" :vs="9" k="最初のログイン" :v="toDateStringMaybe(player.first_login)" />
      <FlippedTableEntry :ks="3" :vs="9" k="最近のログイン試行" :v="toDateStringMaybe(player.last_login_attempt)" />
      <FlippedTableEntry :ks="3" :vs="9" k="最近のログイン" :v="toDateStringMaybe(player.last_login)" />
    </FlippedTable>
    <h2>受けた処罰 ({{ punishments.length }})</h2>
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
          :style="{ cursor: 'pointer' }"
          @click="redirectTo(`/punishments/view?id=${p.id}`)"
      />
    </PunishmentEntriesList>
    <h2>IPアドレス履歴 ({{ player.ipAddressHistory.length }})</h2>
    <FlippedTable>
      <FlippedTableEntry
          v-for="h in player.ipAddressHistory"
          :key="h.last_seen"
          :ks="8"
          :vs="4"
          :v="toDateStringMaybe(h.last_seen)">
        <template v-slot:key>
          <span>{{ h.ip }}</span>
          <span @click="search(h.ip)">
          <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
        </span>
        </template>
      </FlippedTableEntry>
    </FlippedTable>
    <h2>ID履歴 ({{ player.usernameHistory.length }})</h2>
    <FlippedTable>
      <FlippedTableEntry
          v-for="h in player.usernameHistory"
          :key="h.last_seen"
          :ks="8"
          :vs="4"
          :k="h.name"
          :v="toDateStringMaybe(h.last_seen)"
      />
    </FlippedTable>
    <v-btn
        v-if="!fetchedIssuedPunishments"
        :disabled="fetchingIssuedPunishments"
        text="送信した処罰を取得"
        @click="fetchIssuedPunishments()"
    />
    <h2>送信した処罰 ({{ issuedPunishments.length }})</h2>
    <PunishmentEntriesList>
      <PunishmentEntry
          v-for="p in issuedPunishments"
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
    <v-btn
        v-if="!fetchedMore"
        :disabled="fetchingMore"
        text="サブアカウントの情報を取得"
        @click="fetchMore()"
    />
    <h2>サブアカウント ({{ morePlayers.length }})</h2>
    <PlayerEntriesList>
      <PlayerEntry
          v-for="p in morePlayers"
          :key="p.uuid"
          :name="p.name"
          :uuid="p.uuid"
          :last-login="p.last_login"
          :ip="p.ip"
      />
    </PlayerEntriesList>
  </Container>
</template>

<script lang="ts">
import Navbar from '@/components/NavBar.vue'
import Container from '@/components/SpicyContainer.vue'
import FlippedTable from '@/components/FlippedTable.vue'
import FlippedTableEntry from '@/components/FlippedTableEntry.vue'
import { api, search, toast, toDateStringMaybe } from '@/util/util'
import PunishmentEntriesList from '@/components/PunishmentEntriesList.vue'
import PunishmentEntry from '@/components/PunishmentEntry.vue'
import MdIcon from '@/components/MdIcon.vue'
import PlayerEntriesList from '@/components/PlayerEntriesList.vue'
import PlayerEntry from '@/components/PlayerEntry.vue'

export default {
  components: {
    PlayerEntry,
    PlayerEntriesList,
    MdIcon,
    PunishmentEntry,
    PunishmentEntriesList,
    FlippedTableEntry,
    FlippedTable,
    Container,
    Navbar,
  },
  data() {
    return {
      player: null,
      punishments: [],
      issuedPunishments: [],
      morePlayers: [],
      fetchedMore: false,
      fetchingMore: false,
      fetchedIssuedPunishments: false,
      fetchingIssuedPunishments: false,
    }
  },
  methods: {
    search,
    toDateStringMaybe,
    redirectTo(url: string) {
      location.href = url
    },
    fetchIssuedPunishments() {
      if (this.fetchedIssuedPunishments || this.fetchingIssuedPunishments) return
      this.fetchingIssuedPunishments = true
      fetch(api(`/punishments/punishments_by/${this.player.uuid}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        credentials: 'include',
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) return toast('データの取得に失敗しました: ' + err)
        this.fetchedIssuedPunishments = true
        this.issuedPunishments.push(...res.data.reverse())
      }).finally(() => this.fetchingIssuedPunishments = false)
    },
    fetchMore() {
      if (this.fetchedMore || this.fetchingMore) return
      this.fetchingMore = true
      fetch(api(`/players/find_accounts/${this.player.uuid}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        credentials: 'include',
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) return toast('プレイヤーの取得に失敗しました: ' + err)
        this.fetchedMore = true
        this.morePlayers.push(...res.players)
        this.punishments.push(...res.punishments.reverse())
      }).finally(() => this.fetchingMore = false)
    },
    onMeUpdated(me) {
      if (!me) return toast('ログインしていません。')
      const params = new URLSearchParams(location.search)
      const uuid = params.get('uuid')
      if (!uuid) return toast('プレイヤーが存在しません。')
      fetch(api(`/players/get/${uuid}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        credentials: 'include',
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) {
          if (err === 'not_found') {
            toast('プレイヤーが存在しません。')
          } else {
            toast('プレイヤーの取得に失敗しました: ' + err)
          }
          return
        }
        this.player = res
        this.punishments = res.punishments
      })
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
