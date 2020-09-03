<template>
  <div id="app">
    <Header />
    <Container>
      <Scanner />
    </Container>
  </div>
</template>

<script>
import Container from './components/BodyContainer.vue'
import Header from './components/Header.vue'
import Scanner from './components/Scanner.vue'

export default {
  name: 'App',
  components: {
    Header,
    Container,
    Scanner
  },
  created () {
    console.log(document.body.clientHeight)
  },
  mounted () {
    this.updateViewportDimension()
    window.onresize = this.updateViewportDimension()
  },
  updated () {
    this.updateViewportDimension()
  },
  methods: {
    updateViewportDimension () {
      const dom = document.getElementById('app')
      let width = dom.clientWidth
      let height = dom.clientHeight
      this.$store.dispatch('AppEnv/setViewportDimension', [width, height])
    }
  }
}
</script>

<style>
body {
  font-size: 10px;
}
p {
  font-size: 1.2rem;
}
#app {
  font-family: 'Avenir Next', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
