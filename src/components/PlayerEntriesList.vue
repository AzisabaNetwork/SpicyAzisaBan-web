<template>
  <table class="table-fixed striped" style="table-layout: fixed;">
    <thead>
      <tr>
        <th style="width: 16ch;">プレイヤー</th>
        <th style="width: 32ch;">UUID</th>
        <th style="width: 20ch;">IPアドレス</th>
        <th style="width: 20ch;">最終参加</th>
      </tr>
    </thead>
    <tbody>
      <slot />
    </tbody>
  </table>
</template>

<style scoped>
.table-fixed thead th {
  position: sticky;
  position: -webkit-sticky;
  top: -1px;
  z-index: 999;
  background-color: #000;
  color: #fff;
}

.table-fixed {
  border: solid 2px;
  border-radius: 5px;
}
</style>

<style>
table.striped>tbody>tr:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
