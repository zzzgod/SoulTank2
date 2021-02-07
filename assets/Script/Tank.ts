// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    currentSpeed: number = 0;

    @property({displayName:'前向加速度'})
    forwardAcceleration: number = 6;

    @property({displayName:'后向加速度'})
    backwardAcceleration: number = 4;

    @property({displayName:'摩擦力加速度'})
    frictionAcceleration: number = 3;

    @property({displayName:'前向最大速度'})
    forwardSpeed: number = 3;

    @property({displayName:'后向最大速度'})
    backwardSpeed: number = 1;
    
    @property({displayName:'旋转角速度'})
    angularSpeed: number = 1;

    @property({type: cc.Prefab, displayName: '履带轨迹'})
    tracks: cc.Prefab = null;

    @property({type: cc.AudioClip, displayName: '移动音效'})
    moveSound: cc.AudioClip = null;

    @property({displayName: '音量大小'})
    volume: number = 0.5;

    // 设置每走几个像素放一个track
    playSound: boolean = false;
    
    steps: number = 300;
    count = 0;
    audioId: number = 0;
    key_w_pressed: boolean = false;
    key_a_pressed: boolean = false;
    key_s_pressed: boolean = false;
    key_d_pressed: boolean = false;
    // LIFE-CYCLE CALLBACKS:

    body: cc.RigidBody = null;
    collider: cc.PhysicsBoxCollider = null;

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.body = this.node.getComponent(cc.RigidBody);
        this.collider = this.node.getComponent(cc.PhysicsBoxCollider)
    }

    start () {

    }

    update (dt) {
        this.move();
    }

    onKeyDown(e: cc.Event.EventKeyboard){
        switch(e.keyCode){
            case cc.macro.KEY.w:
                this.key_w_pressed = true;
                break;
            case cc.macro.KEY.a:
                this.key_a_pressed = true;
                break;
            case cc.macro.KEY.s:
                this.key_s_pressed = true;
                break;
            case cc.macro.KEY.d:
                this.key_d_pressed = true;
                break;
        }
    }

    onKeyUp(e: cc.Event.EventKeyboard){
        switch(e.keyCode){
            case cc.macro.KEY.w:
                this.key_w_pressed = false;
                break;
            case cc.macro.KEY.a:
                this.key_a_pressed = false;
                break;
            case cc.macro.KEY.s:
                this.key_s_pressed = false;
                break;
            case cc.macro.KEY.d:
                this.key_d_pressed = false;
                break;
        }
    }

    move(){
        this.body.angularVelocity = 0;
        if(this.key_w_pressed && !this.key_s_pressed){
            // 前向加速或保持匀速
            if(this.currentSpeed < this.forwardSpeed)
                this.currentSpeed = Math.min(this.currentSpeed + this.forwardAcceleration, this.forwardSpeed)
        }
        else if(!this.key_w_pressed && this.key_s_pressed){
            // 后向加速或保持匀速
            if(this.currentSpeed > -this.backwardSpeed)
                this.currentSpeed = Math.max(this.currentSpeed - this.backwardAcceleration, -this.backwardSpeed)
        }
        // // 摩擦力减速
        if(Math.abs(this.currentSpeed) < this.frictionAcceleration){
            this.currentSpeed = 0;
        }
        else if(this.currentSpeed > 0){
            this.currentSpeed -= this.frictionAcceleration;
        }
        else{
            this.currentSpeed += this.frictionAcceleration;
        }
        // 转向
        if(this.key_a_pressed && !this.key_d_pressed){
            if(this.currentSpeed >= 0){
                this.body.angularVelocity = -this.angularSpeed;
            }
            else{
                this.body.angularVelocity = this.angularSpeed;
            }
        }
        else if(!this.key_a_pressed && this.key_d_pressed){
            if(this.currentSpeed >= 0){
                this.body.angularVelocity = this.angularSpeed;
            }
            else{
                this.body.angularVelocity = -this.angularSpeed;
            }
        }
        this.body.linearVelocity = cc.v2(this.currentSpeed * Math.cos(this.node.angle * Math.PI / 180), this.currentSpeed * Math.sin(this.node.angle * Math.PI / 180));
        this.collider.apply();

        // 履带特效
        this.count += this.currentSpeed;
        if(this.count > this.steps){
            this.count %= this.steps;
            this.placeTrackBack();
        }
        else if(this.count < -this.steps){
            this.count += this.steps;
            this.placeTraceFront()
        }
        
        // 移动音效
        if(!this.playSound && this.currentSpeed != 0){
            this.audioId = cc.audioEngine.play(this.moveSound, true, this.volume);
            this.playSound = true;
        }
        else if(this.currentSpeed == 0 && this.playSound){
            cc.audioEngine.stop(this.audioId);
            this.playSound = false;
        }
    }

    placeTrackBack () {
        // 在后方绘制两条履带轨迹
        let node1: cc.Node = cc.instantiate(this.tracks), node2: cc.Node = cc.instantiate(this.tracks);
        let script1 = node1.getComponent('Track'), script2 = node2.getComponent('Track');

        let p1: cc.Vec2 = cc.v2(-this.node.width / 2 + 30, this.node.height / 2 - node1.height);
        let p2: cc.Vec2 = cc.v2(-this.node.width / 2 + 30, -this.node.height / 2 + node2.height + 10);
        p1 = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p1));
        p2 = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p2));
        // 绑定父节点
        node1.setParent(this.node.parent);
        node2.setParent(this.node.parent);
        // 置于顶层
        node1.setSiblingIndex(1);
        node2.setSiblingIndex(1);
        node1.setPosition(p1);
        node2.setPosition(p2);
        node1.angle = this.node.angle;
        node2.angle = this.node.angle;
        script1.show();
        script2.show();
    }

    placeTraceFront(){
        // 在后方绘制两条履带轨迹
        let node1: cc.Node = cc.instantiate(this.tracks), node2: cc.Node = cc.instantiate(this.tracks);
        let script1 = node1.getComponent('Track'), script2 = node2.getComponent('Track');

        let p1: cc.Vec2 = cc.v2(this.node.width / 2 - 30, this.node.height / 2 - node1.height);
        let p2: cc.Vec2 = cc.v2(this.node.width / 2 - 30, -this.node.height / 2 + node2.height + 10);
        p1 = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p1));
        p2 = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p2));
        // 绑定父节点
        node1.setParent(this.node.parent);
        node2.setParent(this.node.parent);
        // 置于顶层
        node1.setSiblingIndex(1);
        node2.setSiblingIndex(1);
        node1.setPosition(p1);
        node2.setPosition(p2);
        node1.angle = this.node.angle;
        node2.angle = this.node.angle;
        script1.show();
        script2.show();
    }
}
