<template>
  <div id="container">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'body-container',

}
</script>

<style scoped>
#container {
  display: flex;
  justify-content: center;
  margin: 0px 16px 0px 16px;
}
</style>