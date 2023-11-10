<template>
  <ul id='account-menu' class='dropdown-content'>
    <slot name="menu"/>
  </ul>
  <nav>
    <div class="nav-wrapper">
      <a href="#" data-target="mobile-nav" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      <div style="display: flex">
        <div style="margin: auto; max-width: 20%" class="hide-on-med-and-down"></div>
        <div style="justify-content: center; width: 50%;" v-if="loggedIn">
          <form action="/search" method="get">
            <InputTextField
                label="検索"
                id="search"
                refForRef="search"
                name="q"
                :white-text="true"
                :input-style="{'border-bottom': '1px solid #26a69a'}"
                :label-style="{top: '-5px'}"
                :default-value="defaultSearchWord"
                @input="fireInputEvent"
            />
          </form>
        </div>
        <div class="hide-on-med-and-down" style="display: flex;">
          <div style="margin: auto"></div>
          <ul id="nav-mobile" class="hide-on-med-and-down right" style="justify-content: flex-end;">
            <li id="log-in-out" class="tooltipped" data-position="bottom" data-tooltip="ログインしていません。クリックでログインできます。"
                v-if="!loggedIn">
              <a onclick="M.Modal.getInstance(document.getElementById('login-modal')).open()" class="flex-center">ログイン<i
                  class="material-icons" style="color: #0f0; margin-left: 10px;">login</i></a>
            </li>
            <template v-if="loggedIn">
              <slot name="common"/>
            </template>
            <li v-show="loggedIn">
              <DropdownTrigger :text="username || 'SpicyAzisaBan'" target="account-menu"/>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
  <ul class="sidenav" id="mobile-nav" style="z-index: 1000;">
    <li id="log-in-out-mobile" v-if="!loggedIn">
      <a onclick="M.Modal.getInstance(document.getElementById('login-modal')).open()" class="flex-center">ログイン<i
          class="material-icons" style="color: #0f0; margin-left: 10px;">login</i></a>
    </li>
    <template v-if="loggedIn">
      <slot name="common"/>
      <slot name="menu"/>
    </template>
  </ul>
</template>

<script lang="ts">
import DropdownTrigger from '@/components/DropdownTrigger.vue'
import InputTextField from '@/components/InputTextField.vue'

const enterKeyListener = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  const searchBarActive = document.getElementById('search') === document.activeElement
  if (!searchBarActive) return
  location.href = `/search?q=${encodeURI((document.getElementById('search') as HTMLInputElement).value || '')}`
}

export default {
  components: {
    DropdownTrigger,
    InputTextField,
  },
  props: {
    loggedIn: Boolean,
    username: String,
    defaultSearchWord: String,
  },
  emits: [ 'search-input' ],
  methods: {
    fireInputEvent(event) {
      this.$emit('search-input', event)
    },
  },
  unmounted() {
    document.removeEventListener('keypress', enterKeyListener)
  },
  mounted() {
    document.addEventListener('keypress', enterKeyListener)
  },
}
</script>
