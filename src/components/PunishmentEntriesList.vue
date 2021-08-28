<template>
  <table class="responsive-table table-fixed striped">
    <thead>
      <tr>
        <th>#ID</th>
        <th>種類</th>
        <th>名前/IP</th>
        <th>理由</th>
        <th>期間</th>
        <th>サーバー</th>
        <th></th>
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
