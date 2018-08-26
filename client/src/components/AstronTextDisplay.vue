<template>
    <div>
        <table class="table is-fullwidth is-hoverable">
            <thead>
                <td>Name</td>
                <td>Azimuth</td>
                <td>Elevation</td>
                <td>Magnitude</td>
                <td>Setting Time</td>
            </thead>
            <tbody class="tbody">
                <tr v-for="name in Object.keys(astronDisplayData)">
                    <td>{{name}}</td>
                    <td>{{astronDisplayData[name].az}}</td>
                    <td>{{astronDisplayData[name].el}}</td>
                    <td>{{astronDisplayData[name].magnitude}}</td>
                    <td>{{astronDisplayData[name].setting_time}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>

import util from "./../util.js"

export default {
    props: {
        astronObjects: {type: Object, default: ()=>{return {}}}
    },
    methods: {
        onClick(name){
            console.log(JSON.stringify(this.astronObjects[name]))
        }
    },
    computed: {
        astronDisplayData(){
            var displayData = Object.assign({}, this.astronObjects)
            Object.keys(displayData).forEach((name)=>{
                this.formattableFields.forEach((field)=>{
                    var fieldVal = displayData[name][field]
                    if (typeof fieldVal === "number"){
                        displayData[name][field] = util.radToDegree(fieldVal).toFixed(2)
                    }
                })
            })
            return displayData
        }
    },
    data(){
        return {
            formattableFields: ["az", "el", "ra", "dec"]
        }
    }
}
</script>

<style scoped>
</style>
