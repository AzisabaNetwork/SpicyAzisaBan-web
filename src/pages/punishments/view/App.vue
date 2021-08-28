<!--suppress HttpUrlsUsage -->
<template>
  <Navbar/>
  <Preloader size="big" :active="spinnerActive" color="spinner-blue-only" />
  <Container v-if="punishment">
    <div class="row">
      <div class="col s5" style="margin-left: 0">
        <FlippedTable>
          <FlippedTableEntry k="#ID" :v="'#' + punishment.id" />
          <FlippedTableEntry k="名前/IP" :v="punishment.name" />
          <FlippedTableEntry k="タイプ"><PunishmentType :type="punishment.type" /></FlippedTableEntry>
          <FlippedTableEntry k="理由" :v="punishment.reason" />
          <FlippedTableEntry k="処罰日時" :v="new Date(punishment.start).toLocaleString('ja-JP')" />
          <FlippedTableEntry k="期限切れ日時" :v="new Date(punishment.end).toLocaleString('ja-JP')" v-if="punishment.end > 0" />
          <FlippedTableEntry k="期間" v-if="punishment.end > 0"><Time :time="punishment.end - punishment.start" /></FlippedTableEntry>
          <FlippedTableEntry k="サーバー" :v="punishment.server" />
          <FlippedTableEntry k="執行者" :v="punishment['operator_name']" />
          <FlippedTableEntry k="解除済み"><ColoredBoolean :bool="punishment.unpunished" /></FlippedTableEntry>
          <Dummy v-if="punishment.unpunished">
            <FlippedTableEntry k="解除理由" :v="punishment.unpunish.reason" />
            <FlippedTableEntry k="解除日時" :v="new Date(punishment.unpunish.timestamp).toLocaleString('ja-JP')" />
            <FlippedTableEntry k="解除した人" :v="punishment.unpunish.operator_name" />
          </Dummy>
        </FlippedTable>
      </div>
      <div class="col s1">
        <table class="responsive-table actions-table">
          <thead>
            <tr>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link style="display: block;" :href="'/punishments/edit/' + punishment.id"><MdIcon icon="edit" /></Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <h4>証拠一覧</h4>
    <div class="row">
      <FlippedTable>
        <FlippedTableEntry v-for="proof in punishment.proofs" :key="proof.id" :ks="1" :vs="11" :k="'#' + proof.id" vc="left">
          <MdImage v-if="/\.(png|gif|jpg|jpeg)$/.test(proof.text)" :src="proof.text" style="max-width: 720px; max-height: 480px" />
          <Link v-else-if="proof.text.startsWith('http://') || proof.text.startsWith('https://')" :href="proof.text">{{ proof.text }}</Link>
          <Dummy v-else>{{ proof.text }}</Dummy>
        </FlippedTableEntry>
      </FlippedTable>
    </div>
  </Container>
</template>

<script lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Preloader from '@/components/Preloader.vue'
import Container from '@/components/Container.vue'
import FlippedTable from '@/components/FlippedTable.vue'
import FlippedTableEntry from '@/components/FlippedTableEntry.vue'
import Link from '@/components/Link.vue'
import PunishmentType from '@/components/PunishmentType.vue'
import Time from '@/components/Time.vue'
import ColoredBoolean from '@/components/ColoredBoolean.vue'
import Dummy from '@/components/Dummy.vue'
import MdIcon from '@/components/MdIcon.vue'
import MdImage from '@/components/MdImage.vue'

function toast(text: string) {
  // @ts-ignore
  M.toast({ unsafeHTML: text.replace('\n', '<br />') }) // eslint-disable-line no-undef
  console.log(`Notification: ${text}`)
}

const disableForm = ref(false)

export default {
  components: {
    MdImage,
    MdIcon,
    Dummy,
    ColoredBoolean,
    Time,
    PunishmentType,
    Link,
    FlippedTableEntry,
    FlippedTable,
    Container,
    Preloader,
    Navbar,
  },
  setup() {
    if (!localStorage.getItem('spicyazisaban_session')) {
      setTimeout(() => {
        // @ts-expect-error
        M.Modal.getInstance(document.getElementById('login-modal')).open() // eslint-disable-line no-undef
      }, 200)
      return
    }
    let id = parseInt(new URLSearchParams(window.location.search).get('id'))
    if (!id) id = parseInt(location.pathname.replace(/^\/punishments\/view\/(.*)$/, '$1'))
    if (isNaN(id)) id = 0
    const spinnerActive = ref(!!id)
    const punishment = ref(null)
    if (id) {
      fetch(`${process.env.VUE_APP_API_URL}/punishments/get/${id}`, {
        headers: {
          'Accept': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
      }).then(res => res.json()).then(data => {
        const err = data['error']
        if (err) {
          spinnerActive.value = false
          toast(`処罰ID #${id}が見つかりません。`)
          return
        }
        console.log(data)
        punishment.value = data['data']
        spinnerActive.value = false
      })
    } else {
      toast(`処罰ID #${id}が見つかりません。`)
    }
    return {
      spinnerActive,
      punishment,
      disableForm,
    }
  }
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
td, th {
  text-align: inherit;
}

table.actions-table, table.actions-table>thead>tr, table.actions-table>tbody>tr {
  border: solid 2px;
  border-radius: 5px;
}
</style>
