// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property
    interval: number = 0.07;

    @property({type: cc.SpriteAtlas})
    trackAtlas: cc.SpriteAtlas = null;

    sprite: cc.Sprite = null;
    frame: cc.SpriteFrame[] = null;
    index: number = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.frame = this.trackAtlas.getSpriteFrames();
        this.sprite = this.node.getComponent(cc.Sprite);
    }

    start () {
        
    }

    show () {
        this.schedule(this.onTimer, this.interval, this.frame.length);
    }

    onTimer(){
        if(this.index == this.frame.length){
            this.sprite.spriteFrame = null;
            this.destroy();
            return;
        }
        this.sprite.spriteFrame = this.frame[this.index++];
    }
}
