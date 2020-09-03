<template>
    <div id="header-wrapper">
        <img alt="Vue logo" v-bind="logoProps" src="./../assets/logo-dwt-64x36.svg" fluid />
    </div>
</template>

<script>
export default {
    name: 'dwt-header',
    data () {
        return {
            logoProps: {
                width: 256
            }
        }
    }
}
</script>

<style scoped>
#header-wrapper {
    /* padding: auto 2rem; */
    display: flex;
    justify-content: space-between;
    padding-left: 2rem;
    padding-right: 2rem;
    margin-bottom: 1rem;
    background-color: white;
    box-shadow: 0px 2px 8px rgba(128, 128, 128, .5);
    box-sizing: border-box;
    width: inherit;
    height: 80px;
}
</style>