<template>
<div>
    <div class="field is-horizontal field-body">
        <div class="field">
            <label class="label">Longitude</label>
            <div class="control">
                <input class="input" type="text" v-model="lon"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Latitude</label>
            <div class="control">
                <input class="input" type="text" v-model="lat"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Elevation</label>
            <div class="control">
                <input class="input" type="text" v-model="elevation"/>
            </div>
        </div>
        <div class="field">
            <label class="label">&nbsp;</label>
            <div class="control">
                <button class="button" @click="onClick">Get Ephemerides</button>
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
        onClick(){
            console.log(
                `GeoLocationDisplay.onClick: lat: ${this.lat}, lon: ${this.lon}, elevation: ${this.elevation}`)
            this.$emit(
                "on-change",
                {
                    lon: this.lon,
                    lat: this.lat,
                    elevation: this.elevation
                }
            )
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
