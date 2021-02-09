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

    @property({displayName:'前向最大速度'})
    forwardSpeed: number = 80;

    @property({displayName:'后向最大速度'})
    backwardSpeed: number = 25;
    
    @property({displayName:'旋转角速度'})
    angularSpeed: number = 50;

    @property({displayName:'导航车体半径'})
    navigateRadius: number = 40;

    @property({displayName: '最大偏航距离'})
    maxYawDistance: number = 30;

    @property({displayName: '偏航转向距离'})
    yawSteeringDistance: number = 10;

    @property({displayName: '偏航转向角'})
    yawSteeringAngle: number = 5;

    @property({displayName: '导航停止距离'})
    navigationStopDistance: number = 10;

    @property({displayName: '随机移动半径'})
    randomMoveRadius: number = 100;

    @property({type: cc.Prefab, displayName: '履带轨迹'})
    tracks: cc.Prefab = null;

    @property({type: cc.TiledMap, displayName: '地图'})
    map: cc.TiledMap = null;

    @property({type: cc.SpriteFrame, displayName: '测试背景'})
    testFrame: cc.SpriteFrame = null;

    boolMap: boolean[][] = [];
    pixelMap: boolean[][] = [];
    destination: [cc.Vec2, cc.Vec2] = null;
    destinationList: [cc.Vec2, cc.Vec2][] = [];
    graphics: cc.Graphics = null;

    // 设置每走几个像素放一个track
    playSound: boolean = false;
    
    steps: number = 300;
    count = 0;
    audioId: number = 0;
    // LIFE-CYCLE CALLBACKS:

    body: cc.RigidBody = null;
    collider: cc.PhysicsBoxCollider = null;

    onLoad () {
        this.body = this.node.getComponent(cc.RigidBody);
        this.collider = this.node.getComponent(cc.PhysicsBoxCollider);
        let node: cc.Node = new cc.Node();
        this.graphics = node.addComponent(cc.Graphics);
        this.graphics.lineWidth = 10;
        node.parent = this.node.parent;

        this.createBoolMap();
        this.createPixelMap();
    }

    start () {
        // this.navigate(cc.v2(2315, 2049));
    }

    update (dt) {
        if(this.destination != null){
            this.go();
            this.showEffects();
        }
        else
            this.randomMove();
        // 无目标时保持静止
        if(this.destination == null){
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
            this.collider.apply();
        }
    }

    showEffects(){
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
    }

    // 随机移动
    randomMove(){
        let x = 0, y = 0, dx = 0, dy = 0;
        // 找到一个可到达的的随机点进行移动
        do{
            let angle = Math.random() * 2 * Math.PI;
            dx = this.randomMoveRadius * Math.cos(angle);
            dy = this.randomMoveRadius * Math.sin(angle);
            x = Math.round(this.node.position.x + dx);
            y = Math.round(this.node.position.y + dy);
        }while(!this.pixelMap[x][y] || !this.navigate(cc.v2(x, y)));
    }

    // 推算路径
    navigate(target: cc.Vec2): boolean{
        let paths = this.path(this.node.getPosition(), target);
        if(paths.length == 0){
            return false;
        }
        this.destinationList = [];
        for(let i=0; i<paths.length-1; i++){
            this.destinationList.push([paths[i], paths[i+1]]);
        }
        this.destination = this.destinationList[0];
        this.destinationList.shift();
        return true;
    }

    go(){
        // 没有目标，待机
        if(this.destination == null)
            return;
        let distance = Math.sqrt(Math.pow(this.node.position.x - this.destination[1].x, 2) + Math.pow(this.node.position.y - this.destination[1].y, 2));
        // 若到达目标附近，取得下一个目标
        if(distance < this.navigationStopDistance){
            if(this.destinationList.length != 0)
                this.destination = this.destinationList.shift();
            // 没有目标，停车
            else{
                this.destination = null;
                this.body.angularVelocity = 0;
                this.body.linearVelocity = cc.v2();
                this.collider.apply();
                return;
            }
        }
        // 如果偏航距离过大，重新导航
        let dis = cc.Intersection.pointLineDistance(this.node.getPosition(), this.destination[0], this.destination[1], false);
        if(dis > this.maxYawDistance){
            if(this.destinationList.length != 0)
                this.navigate(this.destinationList[this.destinationList.length-1][1]);
            else
                this.navigate(this.destination[1]);
        }
        // 当前方向与目标方向的夹角
        let vec: cc.Vec2 = this.destination[1].sub(this.node.getPosition());
        let vec2: cc.Vec2 = cc.v2(Math.cos(this.node.angle * Math.PI / 180), Math.sin(this.node.angle * Math.PI / 180))
        let angle = vec.signAngle(vec2) / Math.PI * 180;
        // 如果偏航距离较大或偏角较大，进行转向
        if(dis > this.yawSteeringDistance && Math.abs(angle) > 1 || Math.abs(angle) > this.yawSteeringAngle){
            this.currentSpeed = 0;
            this.body.linearVelocity = cc.v2();
            if(Math.abs(angle) < this.angularSpeed / 60){
                this.body.angularVelocity = 0;
                this.node.angle = vec.angle(cc.v2(1, 0)) * 180 / Math.PI;
            }
            else if(angle > 0)
                this.body.angularVelocity = this.angularSpeed;
            else
                this.body.angularVelocity = -this.angularSpeed;
        }
        // 否则向目标直线前进
        else{
            this.body.angularVelocity = 0;
            this.currentSpeed = this.forwardSpeed;
            this.body.linearVelocity = cc.v2(this.currentSpeed * Math.cos(this.node.angle * Math.PI / 180), this.currentSpeed * Math.sin(this.node.angle * Math.PI / 180));
        }
        this.collider.apply();
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

    createBoolMap() {
        let size: cc.Size = this.map.getTileSize();
        let a = size.width;
        let layer: cc.TiledLayer = this.map.getLayer('wall');
        let layerSize: cc.Size = layer.getLayerSize();
        // 记录的是边线是否可通过
        for(let i=0; i<=layerSize.width; i++){
            this.boolMap.push([]);
            for(let j=0; j<=layerSize.height; j++)
                this.boolMap[i].push(true);
        }
        
        for(let i=0; i<layerSize.width; i++){
            for(let j=0; j<layerSize.height; j++){
                let tile = layer.getTiledTileAt(i, j, true);
                if(tile.gid != 0){
                    // 碰撞圆心
                    let x = (i + 0.5) * a, y = layerSize.height * a - (j + 0.5) * a;
                    // 碰撞圆的半径
                    // 记得改这里
                    let r = Math.sqrt(2) / 2 * a + this.navigateRadius;
                    // 循环判断周围格点
                    let k1 = Math.max(0, Math.ceil((x - r) / a)), k2 = Math.min(layerSize.width, Math.floor((x + r) / a));
                    let l1 = Math.max(0, Math.ceil((y - r) / a)), l2 = Math.min(layerSize.height, Math.floor((y + r) / a));
                    for(let k=k1; k<=k2; k++){
                        for(let l=l1; l<=l2; l++){
                            let x2 = a * k, y2 = a * l;
                            let dis = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
                            if(dis < r)
                                this.boolMap[k][l] = false;
                        }
                    }
                }
            }
        }
    }

    showBoolMap(){
        let size: cc.Size = this.map.getTileSize();
        let layer: cc.TiledLayer = this.map.getLayer('wall');
        let layerSize: cc.Size = layer.getLayerSize();
        for(let i=0; i<=layerSize.width; i++){
            for(let j=0; j<=layerSize.height; j++){
                if(this.boolMap[i][j]){
                    let node: cc.Node = new cc.Node();
                    let sprite: cc.Sprite = node.addComponent(cc.Sprite);
                    sprite.spriteFrame = this.testFrame;
                    node.setPosition(i * size.width, j * size.height);
                    node.setParent(this.node.parent);
                }
            }
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
                    // 碰撞圆心
                    let x = (i + 0.5) * a, y = height - (j + 0.5) * a;
                    // 碰撞圆的半径
                    // 记得改这里
                    let r = Math.sqrt(2) / 2 * a + this.navigateRadius;
                    // 循环判断周围格点
                    let k1 = Math.max(0, Math.ceil(x - r)), k2 = Math.min(width, Math.floor(x + r));
                    let l1 = Math.max(0, Math.ceil(y - r)), l2 = Math.min(height, Math.floor(y + r));
                    // 测试半径是否正确
                    this.graphics.circle(x, y, r);
                    this.graphics.stroke();
                    for(let k=k1; k<=k2; k++){
                        for(let l=l1; l<=l2; l++){
                            let dis = Math.sqrt(Math.pow(x - k, 2) + Math.pow(y - l, 2));
                            if(dis < r)
                                this.pixelMap[k][l] = false;
                        }
                    }
                }
            }
        }
    }

    showPixelMap(){
        for (let i = 0; i < this.pixelMap.length; i++) {
            cc.log(this.pixelMap[i].toString());   
        }  
    }

    path(from: cc.Vec2, to: cc.Vec2): cc.Vec2[]{
        let start: cc.Vec2 = this.getNearestPoint(from), end: cc.Vec2 = this.getNearestPoint(to);
        if(start == null || end == null){
            return [];
        }
        let path = this.findPath(start, end);
        if(path.length == 0){
            return [];
        }
        path.unshift(from);
        path.push(to);
        return this.shortenPath(path);
    }

    getNearestPoint(from: cc.Vec2): cc.Vec2 {
        // 如果起点不可用，直接返回null
        if(!this.pixelMap[Math.round(from.x)][Math.round(from.y)])
            return null;
        let a = this.map.getTileSize().width;
        let x = Math.floor(from.x / a), y = Math.floor(from.y / a);
        let result: cc.Vec2 = null;
        if(this.boolMap[x][y])
            result = cc.v2(x, y);
        else if(this.boolMap[x+1][y])
            result = cc.v2(x+1, y);
        else if(this.boolMap[x][y+1])
            result = cc.v2(x, y+1);
        else if(this.boolMap[x+1][y+1])
            result = cc.v2(x+1, y+1);
        else
            return null;
        return result.mul(a);
    }

    findPath(from_: cc.Vec2, to_: cc.Vec2): cc.Vec2[]{
        let a = this.map.getTileSize().width;
        let layer: cc.TiledLayer = this.map.getLayer('wall');
        let layerSize: cc.Size = layer.getLayerSize();
        let queue: cc.Vec2[] = [];
        let record: cc.Vec2[][] = [];
        let relativeX = [0, 1, 0, -1], relativeY = [-1, 0, 1, 0];
        let from = from_.div(a), to = to_.div(a);
        for(let i=0; i<=layerSize.width; i++){
            record.push([]);
            for(let j=0; j<=layerSize.height; j++){
                record[i].push(null);
            }
        }

        queue.push(from);
        while(queue.length != 0){
            var point = queue.shift();
            if(point.equals(to))
                break;
            let x = point.x, y = point.y;
            for(let i=0; i<4; i++){
                let x2 = x + relativeX[i], y2 = y + relativeY[i];
                // 该点不出界
                if(x2 >= 0 && x2 <= layerSize.width && y2 >= 0 && y2 <= layerSize.height){
                    // 可以走到并且未走过
                    if(this.boolMap[x2][y2] && record[x2][y2] == null){
                        record[x2][y2] = point;
                        queue.push(cc.v2(x2, y2));
                    }
                }    
            }
        }
        let result: cc.Vec2[] = [];
        if(point.equals(to)){
            result.unshift(to.mul(a));
            while(point != from){
                let prev = record[point.x][point.y];
                point = prev;
                result.unshift(point.mul(a));
            }
        }
        return result;
    }

    shortenPath(path: cc.Vec2[]): cc.Vec2[]{
        // 从长到短列举所有子路径，检查是否能直接相连
        for(let i=path.length-1; i>1; i--){
            // j 起点，i+j 终点
            for(let j=0; j<path.length-i; j++){
                if(this.checkLine(path[j], path[i+j])){
                    // 切掉中间点
                    let a=1;
                    path.splice(j+1, i-1);
                    // 刷新路径长度
                    j = 0;
                    i = path.length-1;
                }
            }
        }
        for(let i=0; i<path.length-1; i++){
            this.line(path[i], path[i+1]);
        }
        return path;
    }

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

    line(from: cc.Vec2, to: cc.Vec2){
        this.graphics.strokeColor.set(cc.Color.RED);
        this.graphics.circle(from.x, from.y, 10);
        this.graphics.circle(to.x, to.y, 10);
        this.graphics.stroke();

        this.graphics.strokeColor.set(cc.Color.GREEN);
        this.graphics.moveTo(from.x, from.y);
        this.graphics.lineTo(to.x, to.y);
        this.graphics.stroke();
    }
}
