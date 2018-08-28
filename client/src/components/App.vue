<template>
    <div>
        <div class="columns">
            <div class="column is-one-quarter">
                <time-display
                    class="box"
                    :time="currentTime"
                    @on-change="onTimeChange">
                </time-display>
                <geo-location-display
                    class="box"
                    :geoLocation="geoLocation"
                    @on-change="onGeoLocationChange">
                </geo-location-display>
                <astron-text-display
                    :astronObjects="astronObjects">
                </astron-text-display>
            </div>
            <div class="column" ref="polar-plot-container">
                <d3-polar-plot
                    :circles="astronPlotData"
                    :width="polarPlotWidth"
                    :height="polarPlotHeight"
                    :key="polarPlotKey">
                </d3-polar-plot>
            </div>
        </div>
        <div class="is-size-5" v-html="status"></div>
    </div>
</template>

<script>

import io from "socket.io-client"
import Vue from "vue"
import moment from "moment"

import TimeDisplay from "./TimeDisplay.vue"
import GeoLocationDisplay from "./GeoLocationDisplay.vue"
import AstronTextDisplay from "./AstronTextDisplay.vue"
import D3PolarPlot from "./D3PolarPlot.vue"

import util from "./../util.js"

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
                this.currentTime = moment.utc()
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
                    when: this.currentTime.format(),
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
            var astronObjectsCopy = Object.assign({}, this.astronObjects)
            astronObjectsCopy[name] = data
            this.astronObjects = Object.assign({}, astronObjectsCopy)
            // Vue.set(this.astronObjects, name, data)
            // console.log("getAstronObjectData")
            // console.log(this.astronObjects)
            // this.astronObjects = Object.assign(this.astronObjects, this.astronObjects[name], data)
            // console.log(this.astronObjects)
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
        },
        reRenderPolarPlot(){
            var width = this.$refs["polar-plot-container"].offsetWidth
            this.polarPlotWidth = width
            this.polarPlotHeight = width
            if (this.polarPlotKey === 0){
                this.polarPlotKey = 1
            }else{
                this.polarPlotKey = 0
            }
        }
    },
    watch:{
        astronObjects:{
            handler: function(){
                var astronPlotData = []
                this.astronPlotData = Object.keys(this.astronObjects).forEach((name)=>{
                    var obj = Object.assign({}, this.astronObjects[name])
                    if ("az" in obj){
                        obj.az = util.radToDegree(obj.az)
                        obj.el = util.radToDegree(obj.el)
                        astronPlotData.push(obj)
                    }
                })
                this.astronPlotData = astronPlotData
            },
            deep: true
        }
    },
    mounted(){
        console.log(this.host, this.port)
        this.socket = io(`http://${this.host}:${this.port}`)
        this.registerSocketHandlers(this.socket)
        this.reRenderPolarPlot()

    },
    data(){
        return {
            currentTime: moment.utc(),
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
            },
            astronPlotData: [],
            polarPlotWidth: 100,
            polarPlotHeight: 100,
            polarPlotKey: 0
        }
    }
}
</script>


<style>
.field-label{
    flex-grow: 2;
}
</style>
