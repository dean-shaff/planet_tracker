<template>
<div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Date
            </label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="input" v-model="currentDate"/>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal"></div>
        <div  class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="slider is-fullwidth" step="1" min="0" max="365" v-model="day" type="range">
            </div>
            <div class="control">
                <span class="is-small is-left tooltip is-tooltip-bottom" :data-tooltip="helpText.date">
                    <i class="icon ion-md-help-circle-outline"></i>
                </span>
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
        <div class="field-label is-normal">
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="slider is-fullwidth" step="15" min="0" :max="24*60" v-model="minute" type="range">
            </div>
            <div class="control">
                <span class="is-small is-left tooltip is-tooltip-bottom" :data-tooltip="helpText.time">
                    <i class="icon ion-md-help-circle-outline"></i>
                </span>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label ">
            <label class="label">Longitude</label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded ">
                <input class="input " v-model="lon"/>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label ">
            <label class="label">Latitude</label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="input "v-model="lat"/>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label ">
            <label class="label">Elevation</label>
        </div>
        <div class="field field-body is-grouped">
            <div class="control is-expanded">
                <input class="input "v-model="elevation"/>
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
                <button class="button" @click="onHereClick">Here</button>
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
        geoLocation: {type: Object, default: ()=>{return null}},
        time: {type: Object, default: ()=>{return moment.utc()}}
    },
    methods: {
        onGetEphemeridesClick(){
            this.initialTime = this.parseDateTime()
            console.log(
                `GeoLocationTimeDisplay.onGetEphemeridesClick: lat: ${this.lat}, lon: ${this.lon}, elevation: ${this.elevation}`)
            console.log(
                `GeoLocationTimeDisplay.onGetEphemeridesClick: time: ${this.initialTime}`)
            this.$emit(
                "on-change",
                this.getGeoLocation(),
                this.initialTime
            )
        },
        onHereClick(){
            console.log(
                `GeoLocationDisplay.onHereClick`
            )
            this.$emit("on-here")
        },
        onNowClick(){
            var now = moment.utc()
            this.initialTime = now.clone()
            this.$emit("on-change", this.getGeoLocation(), now)
        },
        parseDateTime(){
            var dateTime = moment.utc(
                `${this.currentDate} ${this.currentTime}`,
                "YYYY/MM/DD HH:mm:ss"
            )
            return dateTime
        },
        getGeoLocation(){
            return {
                lon: this.lon,
                lat: this.lat,
                elevation: this.elevation
            }
        }
    },
    watch: {
        geoLocation(){
            this.lat = this.geoLocation.lat
            this.lon = this.geoLocation.lon
            this.elevation = this.geoLocation.elevation
        },
        time(){
            this.currentTime = this.time.format("HH:mm:ss")
            this.currentDate = this.time.format("YYYY/MM/DD")
        },
        minute(){
            var currentTimeObj = this.initialTime.clone()
            currentTimeObj.add(this.minute, "minutes")
            this.currentTime = currentTimeObj.format("HH:mm:ss")
            this.$emit("on-change", this.getGeoLocation(), this.parseDateTime())
        },
        day(){
            var currentTimeObj = this.initialTime.clone()
            currentTimeObj.add(this.day, "days")
            this.currentDate = currentTimeObj.format("YYYY/MM/DD")
            this.$emit("on-change", this.getGeoLocation(), this.parseDateTime())
        }
    },
    data() {
        return {
            "lat":this.geoLocation.lat,
            "lon":this.geoLocation.lon,
            "elevation":this.geoLocation.elevation,
            initialTime: this.time.clone(),
            currentTime: this.time.format("HH:mm:ss"),
            currentDate: this.time.format("YYYY/MM/DD"),
            minute: 0,
            day: 0,
            helpText: {
                date: "Move the slider to increment the date by 1 day",
                time: "Move the slider to increment the time by 15 minutes"
            }
        }
    }
}
</script>

<style scoped>
.control i {
    margin-top: 0.75rem;
}
</style>
