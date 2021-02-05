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
    }
}
