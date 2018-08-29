import Vue from "vue"

import App from "./components/App.vue"

var init = ()=>{
    var app = new Vue({
        components:{
            "app":App
        },
        data(){
            return {
                port: "5000",
                host: "localhost"
            }
        },
        el: "#app",
        template:`<app ref="app" :port="port" :host="host"></app>`
    })
    return app
}

var app = init()
window.app = app
