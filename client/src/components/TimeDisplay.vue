<template>
<div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Date</label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="input" v-model="currentDate"/>
                <input class="slider is-fullwidth" step="1" min="0" max="365" v-model="day" type="range">
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
                <input class="slider is-fullwidth" step="15" min="0" :max="24*60" v-model="minute" type="range">
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field field-label"></div>
        <div class="field field-body is-grouped">
            <div class="control">
                <button class="button" @click="onGetEphemeridesClick">Get Ephemerides</button>
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
        onGetEphemeridesClick(){
            this.initialTime = this.parseDateTime()
            this.$emit("on-change", this.initialTime)
        },
        onNowClick(){
            var now = moment.utc()
            this.initialTime = now.clone()
            this.$emit("on-change", now)
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
        },
        minute(){
            var currentTimeObj = this.initialTime.clone()
            currentTimeObj.add(this.minute, "minutes")
            this.currentTime = currentTimeObj.format("HH:mm:ss")
            this.$emit("on-change", this.parseDateTime())
        },
        day(){
            var currentTimeObj = this.initialTime.clone()
            currentTimeObj.add(this.day, "days")
            this.currentDate = currentTimeObj.format("YYYY/MM/DD")
            this.$emit("on-change", this.parseDateTime())
        }
    },
    data(){
        return {
            initialTime: this.time.clone(),
            currentTime: this.time.format("HH:mm:ss"),
            currentDate: this.time.format("YYYY/MM/DD"),
            minute: 0,
            day: 0
        }
    }
}
</script>

<style scoped>
</style>
