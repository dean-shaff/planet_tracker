<template>
    <div>
        <div class="columns">
            <div class="column is-one-quarter">
                <time-display
                    :time="currentTime"
                    @on-change="onTimeChange">
                </time-display>
                <geo-location-display
                    :geoLocation="geoLocation"
                    @on-change="onGeoLocationChange">
                </geo-location-display>
                <astron-text-display
                    :astronObjects="astronObjects">
                </astron-text-display>
            </div>
            <d3-polar-plot
                class="column"
                :plotData="astronObjects">
            </d3-polar-plot>
        </div>
        <div class="is-size-5" v-html="status"></div>
    </div>
</template>

<script>

import io from "socket.io-client"
import Vue from "vue"

import TimeDisplay from "./TimeDisplay.vue"
import GeoLocationDisplay from "./GeoLocationDisplay.vue"
import AstronTextDisplay from "./AstronTextDisplay.vue"
import D3PolarPlot from "./D3PolarPlot.vue"

export default {
    props: {
        host: {type: String, default: "localhost"},
        port: {type: String, default: "5000"}
    },
    components:{
        "astron-text-display": AstronTextDisplay,
        "d3-polar-plot": D3PolarPlot,
        "time-display": TimeDisplay,
        "geo-location-display": GeoLocationDisplay
    },
    methods:{
        init(){
            this.requestGeoLocation(
            ).then(this.setGeoLocation
            ).then((geoLocation)=>{
                this.currentTime = new Date().toISOString()
                return this.requestAstronCoordinates(geoLocation)
            }).catch(
                (err) => {
                    console.error(err)
                    this.status = err.message
                }
            )
        },
        requestAstronCoordinates(geoLocation){
            Object.keys(this.astronObjects).forEach((name)=>{
                this.socket.emit("get_astron_object_data", {
                    name: name,
                    when: this.currentTime,
                    cb_name: "get_astron_object_data_handler",
                    geo_location: Object.assign({}, geoLocation)
                })
            })
        },
        setGeoLocation(position){
            if ("coords" in position){
                this.status = "This browser supports geolocation"
                this.geoLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    elevation: position.coords.altitude
                }
            }else{
                this.status = "Browser doesn't support geolocation"
            }
            return this.geoLocation
        },
        requestGeoLocation(){
            if (navigator.geolocation){
                return new Promise(
                    (resolve, reject)=>{navigator.geolocation.getCurrentPosition(resolve, reject)}
                )
            }else{
                return new Promise(
                    (resolve)=>{resolve({})}
                )
            }
        },
        getAstronObjectData(data){
            var name = data.name
            Vue.set(this.astronObjects, name, data)
        },
        registerSocketHandlers(socket){
            socket.on("connect", this.init)
            socket.on("get_astron_object_data_handler", this.getAstronObjectData)
        },
        onTimeChange(newTime){
            this.currentTime = newTime
            this.requestAstronCoordinates(this.geoLocation)
        },
        onGeoLocationChange(newGeoLocation){
            this.geoLocation = Object.assign(this.geoLocation, newGeoLocation)
            this.requestAstronCoordinates(this.geoLocation)
        }
    },
    mounted(){
        console.log(this.host, this.port)
        this.socket = io(`http://${this.host}:${this.port}`)
        this.registerSocketHandlers(this.socket)
    },
    data(){
        return {
            currentTime: new Date().toISOString(),
            geoLocation: {lat: 0.0, lon: 0.0, elevation: 0.0},
            status: "",
            socket: null,
            astronObjects: {
                "Sun": {},
                "Mercury": {},
                "Venus": {},
                "Mars": {},
                "Moon": {},
                "Jupiter": {},
                "Saturn": {},
                "Uranus": {},
                "Neptune": {}
            }
        }
    }
}
</script>


<style scoped>

</style>
