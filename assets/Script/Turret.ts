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

    @property
    angularSpeed: number = 1;

    mouseLocation: cc.Vec2 = cc.v2();

    onLoad () {
        this.node.parent.parent.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
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
}
