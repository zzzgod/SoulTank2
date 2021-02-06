// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    @property({displayName: '角速度'})
    angularSpeed: number = 1;

    @property({type: cc.AudioClip, displayName: '开火音效'})
    fireAudio: cc.AudioClip = null;

    @property({type: cc.Vec2, displayName: '特效位置'})
    firePosition: cc.Vec2 = cc.v2(260, 0);

    @property({displayName: '音量大小'})
    volumn: number = 1;

    @property({type:cc.SpriteAtlas, displayName: '开火特效'})
    fireAtlas: cc.SpriteAtlas = null;

    @property({displayName: '特效刷新速率'})
    interval: number = 0.03;

    // @property({displayName: '炮弹图片'})
    // bullet: cc.SpriteFrame = null;

    @property({displayName: '射速'})
    fireRate: number = 2;

    @property({displayName: '炮弹速度'})
    bulletSpeed: number = 8;

    mouseLocation: cc.Vec2 = cc.v2();

    // 开火特效的节点
    frames: cc.SpriteFrame[] = null;
    index: number = 0;
    subNode: cc.Node = null;
    subSprite: cc.Sprite = null;


    onLoad () {
        this.node.parent.parent.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.parent.parent.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // 加载开火特效
        this.subNode = new cc.Node('fireEffects');
        this.subNode.setPosition(this.firePosition);
        this.subSprite = this.subNode.addComponent(cc.Sprite);
        this.subNode.parent = this.node;
        this.frames = this.fireAtlas.getSpriteFrames();
    }

    start () {

    }

    update (dt) {
        let direction: cc.Vec2 = this.mouseLocation.sub(this.node.parent.getPosition());
        // 鼠标相对父节点的角度
        let mouseAngle: number = Math.atan2(direction.y, direction.x) * 180 / Math.PI - this.node.parent.angle;
        // 计算需要转动的角度[0~360]，0~180正转，180~360反转
        let delta: number = (mouseAngle - this.node.angle + 360) % 360;
        if(delta <= this.angularSpeed){
            this.node.angle = mouseAngle;
        }
        else if(delta >= 360 - this.angularSpeed){
            this.node.angle = mouseAngle;
        }
        else if(delta < 180){
            // 抵消坦克自转的角速度
            this.node.angle += this.angularSpeed - this.node.parent.getComponent('Tank').currentAngularSpeed;
        }
        else{
            this.node.angle -= this.angularSpeed + this.node.parent.getComponent('Tank').currentAngularSpeed;
        }
    }

    onMouseMove(e: cc.Event.EventMouse) {
        // 将鼠标的绝对坐标转换为相对于画布的坐标系
        this.mouseLocation = this.node.parent.parent.convertToNodeSpaceAR(e.getLocation())
    }

    onMouseDown(e: cc.Event.EventMouse) {
        // 开火
        this.schedule(this.onTimer, this.interval, this.frames.length);
        // 音效
        cc.audioEngine.play(this.fireAudio, false, this.volumn);
    }

    onTimer() {
        if(this.index == this.frames.length)
        {
            this.index = 0;
            this.subSprite.spriteFrame = null;
            return;
        }
        this.subSprite.spriteFrame = this.frames[this.index++];
    }

    shoot() {

    }
}
