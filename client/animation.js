
/////////////// ANIMATION ///////////////////

(function() {

    var framesRemaining = 0;
    var nextState = null;
    var punchNum=0; //for alternating hands


    var idle = {
        graphic:"player-128",
        xSize:1,
        play: function(){
            img = idle.graphic;
            xSize = idle.xSize;
            nextState = null;
        }
    };

    var punch ={ 
        graphic: ["player-punch-left-128","player-punch-right-128"],
        xSize:2,
        frames:10,
        goto:idle.play,
        play: function(){
            img = punch.graphic[(punchNum%2)];
            punchNum++
            framesRemaining = punch.frames;
            xSize = punch.xSize;
            nextState = punch.goto;
        }
    };

    function animationUpdate(){
        if (framesRemaining > 0) {
           framesRemaining--
        }
        else{
            if (nextState !=null){
                nextState();
            }
        }
    }

     window.animation = { 
        punch: punch,
        idle: idle,
        animationUpdate: animationUpdate
    };

})();