<template>
  <nav>
    <div class="nav-wrapper">
      <a href="#" data-target="mobile-nav" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      <ul id="nav-mobile" class="hide-on-med-and-down" style="display: flex; justify-content: center;">
        <template v-if="loggedIn">
          <slot />
        </template>
        <li id="log-in-out" class="tooltipped" data-position="bottom" data-tooltip="ログインしていません。クリックでログインできます。" v-if="!loggedIn">
          <a onclick="M.Modal.getInstance(document.getElementById('login-modal')).open()" class="flex-center">ログイン<i class="material-icons" style="color: #0f0; margin-left: 10px;">login</i></a>
        </li>
        <li v-show="loggedIn"><DropdownTrigger :text="username || 'SpicyAzisaBan'" target="account-menu" /></li>
      </ul>
    </div>
  </nav>
  <ul class="sidenav" id="mobile-nav">
    <slot />
    <li id="log-in-out-mobile">
      <a onclick="M.Modal.getInstance(document.getElementById('login-modal')).open()" class="flex-center">ログイン<i class="material-icons" style="color: #0f0; margin-left: 10px;">login</i></a>
    </li>
    <li v-show="loggedIn"><DropdownTrigger :text="username || 'SpicyAzisaBan'" target="account-menu-mobile" /></li>
  </ul>
</template>

<script>
import DropdownTrigger from "@/components/DropdownTrigger";
export default {
  components: { DropdownTrigger },
  props: {
    loggedIn: Boolean,
    username: String,
  },
}
</script>
