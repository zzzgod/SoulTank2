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

    @property({displayName: '特效位置'})
    firePosition: cc.Vec2 = cc.v2(260, 0);

    @property({displayName: '音量大小'})
    volumn: number = 1;

    @property({type:cc.SpriteAtlas, displayName: '开火特效'})
    fireAtlas: cc.SpriteAtlas = null;

    @property({displayName: '特效刷新速率'})
    interval: number = 0.03;

    @property({displayName: '炮弹', type: cc.Prefab})
    bullet: cc.Prefab = null;

    @property({displayName: '炮弹位置'})
    bulletPosition: cc.Vec2 = cc.v2(270, 6);

    @property({displayName: '射速'})
    fireRate: number = 2;

    mouseLocation: cc.Vec2 = cc.v2();

    // 开火特效的节点
    frames: cc.SpriteFrame[] = null;
    index: number = 0;
    subNode: cc.Node = null;
    subSprite: cc.Sprite = null;

    // 开火冷却
    cooldown: boolean = false;


    onLoad () {
        this.node.parent.parent.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.parent.parent.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
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
        // 将鼠标的摄像机坐标转换为绝对坐标
        let camera = cc.find('Canvas/Main Camera').getComponent(cc.Camera);
        let location = camera.getScreenToWorldPoint(this.mouseLocation);
        // 炮塔应指向的方向
        let direction: cc.Vec3 = location.sub(cc.v3(this.node.parent.getPosition()));
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
            this.node.angle += this.angularSpeed + this.node.parent.getComponent(cc.RigidBody).angularVelocity / 60;
        }
        else{
            this.node.angle -= this.angularSpeed - this.node.parent.getComponent(cc.RigidBody).angularVelocity / 60;
        }
    }

    onMouseMove(e: cc.Event.EventMouse) {
        // 获得鼠标的摄像机坐标
        this.mouseLocation = e.getLocation();
    }

    onMouseDown(e: cc.Event.EventMouse) {
        // 判断是否在冷却中
        if(this.cooldown)
            return;
        this.cooldown = true;
        let self = this;
        // 等待一段时间后，可再次开炮
        setTimeout(function refresh() {
            self.cooldown = false;
        }, this.fireRate * 1000);
        // 开火特效
        this.schedule(this.onTimer, this.interval, this.frames.length);
        // 音效
        cc.audioEngine.play(this.fireAudio, false, this.volumn);
        // 发射子弹
        let bullet: cc.Node = cc.instantiate(this.bullet);
        let position = this.node.parent.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.bulletPosition))
        bullet.angle = this.node.angle + this.node.parent.angle;
        bullet.setParent(this.node.parent.parent);
        bullet.setPosition(position);
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

    // onKeyDown(e: cc.Event.EventKeyboard) {
    //     if(e.keyCode == cc.macro.KEY.space){
    //         cc.log(this.mouseLocation.toString());
    //         cc.log(this.node.parent.getPosition().toString());
    //         let direction: cc.Vec2 = this.mouseLocation.sub(this.node.parent.getPosition());
    //         // 鼠标相对父节点的角度
    //         let mouseAngle: number = Math.atan2(direction.y, direction.x) * 180 / Math.PI - this.node.parent.angle;
    //         cc.log(direction.toString())
    //         cc.log(mouseAngle.toString())
    //     }
    // }
}
