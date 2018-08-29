<template>
<div>
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
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: {
        geoLocation: {type: Object, default: ()=>{return null}}
    },
    methods: {
        onGetEphemeridesClick(){
            console.log(
                `GeoLocationDisplay.onGetEphemeridesClick: lat: ${this.lat}, lon: ${this.lon}, elevation: ${this.elevation}`)
            this.$emit(
                "on-change",
                {
                    lon: this.lon,
                    lat: this.lat,
                    elevation: this.elevation
                }
            )
        },
        onHereClick(){
            console.log(
                `GeoLocationDisplay.onHereClick`
            )
            this.$emit("on-here")
        }
    },
    watch:{
        geoLocation(){
            this.lat = this.geoLocation.lat
            this.lon = this.geoLocation.lon
            this.elevation = this.geoLocation.elevation
        }
    },
    data(){
        return Object.assign({}, this.geoLocation)
    }
}
</script>

<style scoped>

</style>
