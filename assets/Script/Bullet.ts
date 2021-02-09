// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({displayName: '子弹速度'})
    speed: number = 480;

    body: cc.RigidBody = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.group = 'bullet';
        this.body = this.node.getComponent(cc.RigidBody);
    }

    start () {

    }

    update (dt) {
        this.body.linearVelocity = cc.v2(this.speed * Math.cos(this.node.angle / 180 * Math.PI), this.speed * Math.sin(this.node.angle / 180 * Math.PI));
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        this.node.destroy();
        
    }
}
