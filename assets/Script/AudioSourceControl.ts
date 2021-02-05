// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.AudioSource)
    audioSourse: cc.AudioSource = null

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        
    }

    play () {
        this.audioSourse.play();
    }

    pause () {
        this.audioSourse.pause();
    }

    resume() {
        this.audioSourse.resume();
    }

    stop () {
        this.audioSourse.stop();
    }

    // update (dt) {}
}
