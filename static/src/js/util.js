var util = {
    requestData: function(route, position, callbacks){
        // console.log("Route: {}, Position: {}".format(route, position));
        position.continuous = false ;
        $.ajax({
            type:"POST",
            url: $SCRIPT_ROOT+route,
            data : JSON.stringify(position),
            success: function(msg){
                var data = JSON.parse(msg.result);
                // console.log(data[0].name);
                callbacks.forEach(function(callback){
                    callback(data) ;
                })
            },
            failure: function(msg){
                console.log("Failure message from server: "+msg);
            }
        });
    },
    mapRange: function(low1, high1, low2, high2){
        var diff1 = high1 - low1 ;
        var diff2 = high2 - low2 ;
        return function(x){
            return (((x - low1)/diff1) * diff2) + low2;
        }
    },

    toDegree: function(radian){
            return (180.*radian)/(Math.PI)
    }
}
