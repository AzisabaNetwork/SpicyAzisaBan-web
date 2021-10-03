<template>
  <ul id='account-menu' class='dropdown-content'>
    <slot name="menu" />
  </ul>
  <nav>
    <div class="nav-wrapper">
      <a href="#" data-target="mobile-nav" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      <div class="hide-on-med-and-down" style="display: flex;">
        <div style="margin-left: 10%; margin-right: 10%;"></div>
        <div style="margin: auto" v-if="false && loggedIn"></div>
        <div style="justify-content: center; width: 30%;" v-if="false && loggedIn">
          <InputTextField label="検索" id="search" ref="search" :white-text="true" input-style="border-bottom: 1px solid #26a69a" label-style="top: -5px" />
        </div>
        <div style="margin: auto"></div>
        <ul id="nav-mobile" class="hide-on-med-and-down right" style="justify-content: flex-end;">
          <li id="log-in-out" class="tooltipped" data-position="bottom" data-tooltip="ログインしていません。クリックでログインできます。" v-if="!loggedIn">
            <a onclick="M.Modal.getInstance(document.getElementById('login-modal')).open()" class="flex-center">ログイン<i class="material-icons" style="color: #0f0; margin-left: 10px;">login</i></a>
          </li>
          <Dummy v-if="loggedIn">
            <slot name="common" />
          </Dummy>
          <li v-show="loggedIn"><DropdownTrigger :text="username || 'SpicyAzisaBan'" target="account-menu" /></li>
        </ul>
      </div>
    </div>
  </nav>
  <ul class="sidenav" id="mobile-nav" style="z-index: 1000;">
    <li id="log-in-out-mobile" v-if="!loggedIn">
      <a onclick="M.Modal.getInstance(document.getElementById('login-modal')).open()" class="flex-center">ログイン<i class="material-icons" style="color: #0f0; margin-left: 10px;">login</i></a>
    </li>
    <Dummy v-if="loggedIn">
      <slot name="common" />
      <slot name="menu" />
    </Dummy>
  </ul>
</template>

<script>
import DropdownTrigger from "@/components/DropdownTrigger"
import InputTextField from "@/components/InputTextField"
import Dummy from '@/components/Dummy'

export default {
  components: {
    Dummy,
    DropdownTrigger,
    InputTextField,
  },
  props: {
    loggedIn: Boolean,
    username: String,
  },
}
</script>
