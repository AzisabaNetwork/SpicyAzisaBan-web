<template>
  <table class="table-fixed striped" style="table-layout: fixed;">
    <thead>
      <tr>
        <th style="width: 8ch;">ID</th>
        <th style="width: 32ch;">ユーザー名</th>
        <th style="width: 32ch;">メールアドレス</th>
        <th style="width: 8ch;">グループ</th>
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
