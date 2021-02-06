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

    currentAngularSpeed: number = 0;

    @property({displayName:'前向加速度'})
    forwardAcceleration: number = 0.06;

    @property({displayName:'后向加速度'})
    backwardAcceleration: number = 0.03;

    @property({displayName:'摩擦加速度'})
    frictionAcceleration: number = 0.02;

    @property({displayName:'前向最大速度'})
    forwardSpeed: number = 4;

    @property({displayName:'后向最大速度'})
    backwardSpeed: number = 1;
    
    @property({displayName:'旋转角速度'})
    angularSpeed: number = 1;

    @property({type: cc.Prefab, displayName: '履带轨迹'})
    tracks: cc.Prefab = null;

    // 设置每走几个像素放一个track
    steps: number = 10;
    count = 0;
    
    key_w_pressed: boolean = false;
    key_a_pressed: boolean = false;
    key_s_pressed: boolean = false;
    key_d_pressed: boolean = false;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
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
        this.currentAngularSpeed = 0;
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
        // 摩擦力减速
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
                this.currentAngularSpeed = this.angularSpeed;
            }
            else{
                this.currentAngularSpeed = -this.angularSpeed;
            }
        }
        else if(!this.key_a_pressed && this.key_d_pressed){
            if(this.currentSpeed >= 0){
                this.currentAngularSpeed = -this.angularSpeed;
            }
            else{
                this.currentAngularSpeed = this.angularSpeed;
            }
        }
        this.node.angle += this.currentAngularSpeed;
        this.node.x += this.currentSpeed * Math.cos(this.node.angle * Math.PI / 180);
        this.node.y += this.currentSpeed * Math.sin(this.node.angle * Math.PI / 180);

        this.count += this.currentSpeed;
        if(this.count > this.steps){
            this.count %= this.steps;
            this.placeTrack();
        }
    }

    placeTrack () {
        // 绘制两条履带轨迹
        let node1: cc.Node = cc.instantiate(this.tracks), node2: cc.Node = cc.instantiate(this.tracks);
        let script1 = node1.getComponent('Track'), script2 = node2.getComponent('Track');

        let p1: cc.Vec2 = cc.v2(-this.node.width / 2 - node1.width / 2, this.node.height / 2 - node1.height / 2);
        let p2: cc.Vec2 = cc.v2(-this.node.width / 2 - node2.width / 2, -this.node.height / 2 + node2.height / 2);
        p1 = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p1));
        p2 = this.node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p2));

        node1.setParent(this.node.parent);
        node2.setParent(this.node.parent);
        node1.setPosition(p1);
        node2.setPosition(p2);
        node1.angle = this.node.angle;
        node2.angle = this.node.angle;
        script1.show();
        script2.show();
    }
}
