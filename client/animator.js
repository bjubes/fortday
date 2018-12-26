
class Animator {

    constructor(){
        var anim = this

        this.framesRemaining = 0;
        this.nextState = null;
        this.punchNum = 0;
        this.image = 'player-128' 
        this.xSize = 1
    

        this.idle = {
            graphic:"player-128",
            xSize:1,
            play: function(){
                this.image = this.idle.graphic;
                this.xSize = this.idle.xSize;
                this.nextState = null;
            }
        };
        
        this.punch = {
            graphic: ["player-punch-left-128","player-punch-right-128"],
            xSize:2,
            frames:10,
            goto:this.idle.play,
            play: function(){
                anim.image = this.graphic[(anim.punchNum%2)];
                anim.punchNum++
                anim.framesRemaining = this.frames;
                anim.xSize = this.xSize;
                anim.nextState = this.goto;
            }
        };
    }

    animationUpdate(){
        if (this.framesRemaining > 0) {
           this.framesRemaining--
        }
        else{
            if (this.nextState !=null){
                this.nextState();
            }
        }
    }
}

window.Animator = Animator;

