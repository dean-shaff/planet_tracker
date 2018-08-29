<template>
    <div>
        <table class="table is-hoverable">
            <thead>
                <td>Name</td>
                <td>Azimuth/ Elevation</td>
                <td><a href="https://en.wikipedia.org/wiki/Apparent_magnitude" target="_blank"><em>m</em></a></td>
                <td>Setting Time (UTC)</td>
            </thead>
            <tbody class="tbody">
                <tr v-for="name in Object.keys(astronDisplayData)">
                    <td>{{name}}</td>
                    <td>{{astronDisplayData[name].az}}&deg;/{{astronDisplayData[name].el}}&deg;</td>
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
        },
        updateDisplayData(){
            var displayData = {}
            Object.keys(this.astronObjects).forEach((name)=>{
                var displayObject = Object.assign({}, this.astronObjects[name])
                this.formattableFields.forEach((field)=>{
                    var fieldVal = displayObject[field]
                    if (typeof fieldVal === "number"){
                        displayObject[field] = util.radToDegree(fieldVal).toFixed(2)
                    }
                })
                displayData[name] = displayObject
            })
            return displayData
        }
    },
    computed: {
        astronDisplayData: function(){
            return this.updateDisplayData()
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
