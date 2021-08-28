<!--suppress HttpUrlsUsage -->
<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" />
  <Preloader size="big" :active="spinnerActive" color="spinner-blue-only" />
  <Container v-if="punishment">
    <div class="row">
      <div class="col s11" style="margin-left: 0">
        <FlippedTable>
          <FlippedTableEntry :ks="2" :vs="10" k="#ID" :v="'#' + punishment.id" />
          <FlippedTableEntry :ks="2" :vs="10" k="名前/IP" :v="punishment.name" />
          <FlippedTableEntry :ks="2" :vs="10" k="タイプ"><PunishmentType :type="punishment.type" /></FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="理由">
            <InputTextField v-if="editing" id="p-reason" ref="reason" white-text label="理由" :default-value="punishment.reason" active-label />
            <Dummy v-else>{{ punishment.reason }}</Dummy>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="処罰日時" :v="new Date(punishment.start).toLocaleString('ja-JP')" />
          <FlippedTableEntry :ks="2" :vs="10" k="期限切れ日時" :v="new Date(punishment.end).toLocaleString('ja-JP')" v-if="punishment.end > 0" />
          <FlippedTableEntry :ks="2" :vs="10" k="期間" v-if="punishment.end > 0"><Time :time="punishment.end - punishment.start" /></FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="サーバー">
            <InputTextField
                v-if="(this.$refs.navbar.user.group === 'manager' || this.$refs.navbar.user.group === 'admin') && editing"
                id="p-server"
                ref="server"
                white-text
                label="サーバー"
                :default-value="punishment.server"
                active-label
            />
            <Dummy v-else>{{ punishment.server }}</Dummy>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="執行者" :v="punishment['operator_name']" />
          <FlippedTableEntry :ks="2" :vs="10" k="解除済み"><ColoredBoolean :bool="punishment.unpunished" /></FlippedTableEntry>
          <Dummy v-if="punishment.unpunished">
            <FlippedTableEntry :ks="2" :vs="10" k="解除理由">
              <InputTextField v-if="editing" id="p-u-reason" ref="unpunishReason" white-text label="解除理由" :default-value="punishment.unpunish.reason" active-label />
              <Dummy v-else>{{ punishment.unpunish.reason }}</Dummy>
            </FlippedTableEntry>
            <FlippedTableEntry :ks="2" :vs="10" k="解除日時" :v="new Date(punishment.unpunish.timestamp).toLocaleString('ja-JP')" />
            <FlippedTableEntry :ks="2" :vs="10" k="解除した人" :v="punishment.unpunish.operator_name" />
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
                <Link style="display: block; cursor: pointer;" :class="'editing-' + editing.toString()" @click="onEditButtonClick">
                  <MdIcon icon="edit" />
                </Link>
              </td>
            </tr>
            <tr v-if="editing">
              <td>
                <Link style="display: block;" :class="'update-button-' + isUpdatingData.toString()" @click="updateData()">
                  <MdIcon icon="save" />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <h4>証拠一覧</h4>
    <div class="row">
      <FlippedTable style="width: 100%">
        <FlippedTableEntry v-for="proof in punishment.proofs" :key="proof.id" :ks="1" :vs="11" :k="'#' + proof.id" vc="left full-width text-align-left">
          <Dummy v-if="editing">
            <InputTextField :id="'p-p-' + proof.id" :ref="'proof-' + proof.id" white-text :label="'証拠 #' + proof.id" :default-value="proof.text" active-label />
          </Dummy>
          <Dummy v-else>
            <MdImage v-if="/\.(png|gif|jpg|jpeg)$/.test(proof.text)" :src="proof.text" style="max-width: 90%; max-height: 90%;" />
            <Link v-else-if="proof.text.startsWith('http://') || proof.text.startsWith('https://')" :href="proof.text">{{ proof.text }}</Link>
            <Dummy v-else>{{ proof.text }}</Dummy>
          </Dummy>
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
import InputTextField from '@/components/InputTextField.vue'

function toast(text: string) {
  // @ts-ignore
  M.toast({ unsafeHTML: text.replace('\n', '<br />') }) // eslint-disable-line no-undef
  console.log(`Notification: ${text}`)
}

const editing = ref(false)
const isUpdatingData = ref(false)
const punishment = ref(null)

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
    InputTextField,
  },
  data() {
    return {
      navbar: {},
    }
  },
  methods: {
    onEditButtonClick() {
      editing.value = !editing.value
      if (!editing.value) {
        setTimeout(() => {
          const elems = document.querySelectorAll('.materialboxed')
          // @ts-ignore
          M.Materialbox.init(elems) // eslint-disable-line no-undef
        }, 10)
      }
    },
    updateData() {
      if (!editing.value || isUpdatingData.value || !punishment.value) return
      isUpdatingData.value = true
      fetch(`${process.env.VUE_APP_API_URL}/punishments/update`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        body: JSON.stringify({
          id: punishment.value.id,
          reason: this.$refs.reason.value,
          server: this.$refs.server?.value || punishment.value.server,
          unpunish_reason: this.$refs.unpunishReason?.value || null,
          proofs: punishment.value.proofs.map(p => ({ id: p.id, value: this.$refs[`proof-${p.id}`].value })),
        }),
      }).then(res => res.json()).then(async res => {
        if (res['error']) {
          toast(`処罰データの更新に失敗しました: ${res['error']}`)
          return
        }
        await fetch(`${process.env.VUE_APP_API_URL}/punishments/get/${punishment.value.id}`, {
          headers: {
            'Accept': 'application/json',
            'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
          },
        }).then(res => res.json()).then(data => {
          const err = data['error']
          if (err) {
            toast(`処罰情報の取得中にエラーが発生しました。`)
            return
          }
          console.log(data)
          punishment.value = data['data']
        })
        toast('処罰データを更新しました。')
        editing.value = false
      }).finally(() => isUpdatingData.value = false)
    },
  },
  setup() {
    if (!localStorage.getItem('spicyazisaban_session')) {
      setTimeout(() => {
        // @ts-expect-error
        M.Modal.getInstance(document.getElementById('login-modal')).open() // eslint-disable-line no-undef
      }, 200)
      return
    }
    const params = new URLSearchParams(window.location.search)
    let id = parseInt(params.get('id'))
    if (!id) id = parseInt(location.pathname.replace(/^\/punishments\/view\/(.*)$/, '$1'))
    if (isNaN(id)) id = 0
    const spinnerActive = ref(!!id)
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
        editing.value = params.has('edit')
        spinnerActive.value = false
      })
    } else {
      toast(`処罰ID #${id}が見つかりません。`)
    }
    return {
      spinnerActive,
      punishment,
      editing,
      isUpdatingData,
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

.full-width {
  width: 100%;
}

.text-align-left {
  text-align: left;
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

.update-button-true {
  color: gray;
  cursor: not-allowed;
}

.update-button-false {
  cursor: pointer;
}

.editing-true {
  color: orange;
  transition: all 200ms;
}

.editing-false {
  color: gray;
  transition: all 200ms;
}
</style>
