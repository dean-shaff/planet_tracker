<template>
    <div class="field is-grouped">
            <div class="control is-expanded">
                <label class="label">Time (UTC)</label>
                <input class="input" v-model="currentTime"/>
            </div>
            <div class="control">
                <label class="label">&nbsp;</label>
                <button class="button" @click="onClick">Change Time</button>
            </div>
    </div>
</template>

<script>
export default {
    props: {
        time: {type: String, default: ""}
    },
    methods: {
        onClick(){
            this.$emit("on-change", this.currentTime)
        }
    },
    watch: {
        time(){
            this.currentTime = this.time
        }
    },
    data(){
        return {
            currentTime: this.time
        }
    }
}
</script>

<style scoped>
</style>
