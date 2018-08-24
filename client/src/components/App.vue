<template>
    <div>
        <div class="is-size-1" v-html="status"></div>
        <div v-for="key in Object.keys(geoLocation)">
            <div class="is-size-2" v-html="geoLocation[key]">
            </div>
        </div>
        <a class="button">Button</a>
    </div>
</template>

<script>

import io from "socket.io-client"

export default {
    methods:{
        init(){
            this.getGeoLocation(
            ).then((position)=>{
                this.geoLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    elevation: position.coords.altitude
                }
                return this.geoLocation
            }).then((geoLocation)=>{
                return this.initialRequest(geoLocation)
            }).catch(
                (err) => {
                    console.error(err)
                    this.status = err.message
                }
            )
        },
        initialRequest(geoLocation){
            console.log(JSON.stringify(geoLocation))
        },
        getGeoLocation(){
            if (navigator.geolocation){
                this.status = "This browser supports geolocation"
                return new Promise(
                    (resolve, reject)=>{navigator.geolocation.getCurrentPosition(resolve, reject)}
                )
            }else{
                this.status = "Browser doesn't support geolocation"
                return new Promise(
                    (resolve)=>{resolve({})}
                )
            }
        },
        registerSocketHandlers(){}
    },
    mounted(){
        this.init()
    },
    data(){
        return {
            geoLocation: {lat: 0.0, lon: 0.0, elevation: 0.0},
            status: ""
        }
    }
}
</script>


<style scoped>

</style>
