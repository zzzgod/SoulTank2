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

    @property({displayName: '炮弹角度浮动'})
    bulletAngleFloatingRange = 10;

    @property({displayName: '射速'})
    fireRate: number = 2;

    @property({type: cc.Node, displayName: '攻击目标'})
    target: cc.Node = null;

    @property({displayName: '索敌半径'})
    searchRadius = 150;

    @property({type: cc.TiledMap, displayName: '地图'})
    map: cc.TiledMap = null;

    // 开火特效的节点
    frames: cc.SpriteFrame[] = null;
    index: number = 0;
    subNode: cc.Node = null;
    subSprite: cc.Sprite = null;

    // 开火冷却
    cooldown: boolean = false;
    pixelMap: boolean[][] = [];


    onLoad () {
        // 加载开火特效
        this.subNode = new cc.Node('fireEffects');
        this.subNode.setPosition(this.firePosition);
        this.subSprite = this.subNode.addComponent(cc.Sprite);
        this.subNode.parent = this.node;
        this.frames = this.fireAtlas.getSpriteFrames();
        this.createPixelMap();
    }

    start () {

    }

    update (dt) {
        this.aim();
        this.fire();
    }

    aim() {
        // 如果能看到敌人
        if(this.checkLine(this.node.parent.getPosition(), this.target.getPosition())){
            // 目标相对于父节点的偏转角
            let targetAngle = cc.v2(1, 0).signAngle(this.target.getPosition().sub(this.node.parent.getPosition())) * 180 / Math.PI;
            // 相对父节点的角度
            let relativeAngle = targetAngle - this.node.parent.angle;
            // 计算需要转动的角度[0~360]，0~180正转，180~360反转
            let delta: number = (targetAngle - (this.node.angle + this.node.parent.angle) + 720) % 360;
            if(delta <= this.angularSpeed){
                this.node.angle = relativeAngle;
            }
            else if(delta >= 360 - this.angularSpeed){
                this.node.angle = relativeAngle;
            }
            else if(delta < 180){
                // 抵消坦克自转的角速度
                this.node.angle += this.angularSpeed + this.node.parent.getComponent(cc.RigidBody).angularVelocity / 60;
            }
            else{
                this.node.angle -= this.angularSpeed - this.node.parent.getComponent(cc.RigidBody).angularVelocity / 60;
            }
        }
    }

    fire(){
        // 判断是否在冷却中
        if(this.cooldown)
            return;
        // 若能打到敌人
        if(this.checkLine(this.node.parent.getPosition(), this.target.getPosition())){
            // 进入冷却
            this.cooldown = true;
            let self = this;
            // 等待一段时间后，可再次开炮
            setTimeout(function refresh() {
                self.cooldown = false;
            }, this.fireRate * 1000);
            // 发射子弹
            let bullet: cc.Node = cc.instantiate(this.bullet);
            let position = this.node.parent.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(this.bulletPosition))
            bullet.angle = this.node.angle + this.node.parent.angle + this.bulletAngleFloatingRange * 2 * (Math.random() - 0.5);
            bullet.setParent(this.node.parent.parent);
            bullet.setPosition(position);
        }
    }

    createPixelMap() {
        let size: cc.Size = this.map.getTileSize();
        let a = size.width;
        let layer: cc.TiledLayer = this.map.getLayer('wall');
        let layerSize: cc.Size = layer.getLayerSize();
        let width = layerSize.width * a, height = layerSize.height * a;
        for(let i=0; i<=width; i++){
            this.pixelMap.push([]);
            for(let j=0; j<=height; j++)
                this.pixelMap[i].push(true);
        }
        for(let i=0; i<layerSize.width; i++){
            for(let j=0; j<layerSize.height; j++){
                let tile = layer.getTiledTileAt(i, j, true);
                if(tile.gid != 0){
                    // 地图块的左上角
                    let x = i * a, y = height - j * a;
                    // 将地图块的每一个像素标记为不可穿过
                    for(let k=x; k<=x+a; k++){
                        for(let l=y; l<=y+a; l++){
                            this.pixelMap[k][l] = false;
                        }
                    }
                }
            }
        }

    }

    // 检测子弹是否会撞上墙壁
    checkLine(from: cc.Vec2, to: cc.Vec2): boolean{
        let vec = to.sub(from);
        let step = vec.normalize(), point = from.clone();
        for(let i=0; i<vec.len(); i++, point.addSelf(step)){
            let x = Math.floor(point.x), y = Math.floor(point.y);
            if(!this.pixelMap[x][y] || !this.pixelMap[x][y+1] || !this.pixelMap[x+1][y] || !this.pixelMap[x+1][y+1]){
                return false;
            }
        }
        return true;
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
}
