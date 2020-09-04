<template>
  <div :id="id" class="placeholder" :style="{ width: width, height: height }">

  </div>
</template>

<script>
export default {
  name: 'dwt-viewer',
  props: ['id', 'width', 'height']
}
</script>

<style scoped>
.placeholder {
  background-color: #66ccff;
  width: 600px;
  height: 600px;
}
* {
  box-sizing: border-box;
}
</style>
