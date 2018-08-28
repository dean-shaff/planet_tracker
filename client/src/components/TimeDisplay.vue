<template>
<div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Date</label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="input" v-model="currentDate"/>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Time</label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="input" v-model="currentTime"/>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field field-label"></div>
        <div class="field field-body is-grouped">
            <div class="control">
                <button class="button" @click="onChangeTimeClick">Get Ephemerides</button>
            </div>
            <div class="control">
                <button class="button" @click="onNowClick">Now</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>

import moment from "moment"


export default {
    props: {
        time: {type: Object, default: ()=>{return moment.utc()}}
    },
    methods: {
        onChangeTimeClick(){
            this.$emit("on-change", this.parseDateTime())
        },
        onNowClick(){
            this.$emit("on-change", moment.utc())
        },
        parseDateTime(){
            var dateTime = moment.utc(
                `${this.currentDate} ${this.currentTime}`,
                "YYYY/MM/DD HH:mm:ss"
            )
            return dateTime
        }
    },
    watch: {
        time(){
            this.currentTime = this.time.format("HH:mm:ss")
            this.currentDate = this.time.format("YYYY/MM/DD")
        }
    },
    data(){
        return {
            currentTime: this.time.format("HH:mm:ss"),
            currentDate: this.time.format("YYYY/MM/DD")
        }
    }
}
</script>

<style scoped>
</style>
