import Vue from "vue"

import App from "./components/App.vue"

var init = ()=>{
    var app = new Vue({
        components:{
            "app":App
        },
        el: "#main",
        template:`<app ref="app"></app>`
    })
    return app
}

var app = init()
window.app = app
