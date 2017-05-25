function Logger(name, level){

    this.name = name ;
    this.level = level ;

    this.log = function(msg){
        console.log("{}:{}: {}".format(msg, this.level, this.name))
    }
}