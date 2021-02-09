// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    
    @property({type: cc.TiledMap, displayName: '地图'})
    map: cc.TiledMap = null;

    @property({displayName: '坦克宽度'})
    width = 0;

    @property({type: cc.SpriteFrame, displayName: '测试图块'})
    testFrame: cc.SpriteFrame = null;

    boolMap: boolean[][] = [];
    pixelMap: boolean[][] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    }

    start () {
        this.createBoolMap();
        this.createPixelMap();
        // this.showBoolMap();
        // this.showPixelMap();
        this.path(cc.v2(200, 170), cc.v2(2315, 2049));
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
                    let x = (i + 0.5) * a, y = (j + 0.5) * a;
                    // 碰撞圆的半径
                    // 记得改这里
                    let r = Math.sqrt(2) / 2 * a + this.width / 2;
                    // 循环判断周围格点
                    let k1 = Math.max(0, Math.ceil((x - r) / a)), k2 = Math.min(layerSize.width, Math.floor((x + r) / a));
                    let l2 = layerSize.height - Math.max(0, Math.ceil((y - r) / a));
                    let l1 = layerSize.height - Math.min(layerSize.height, Math.floor((y + r) / a));
                    for(let k=k1; k<=k2; k++){
                        for(let l=l1; l<=l2; l++){
                            let x2 = a * k, y2 = a * (layerSize.height - l);
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
                    let x = (i + 0.5) * a, y = (j + 0.5) * a;
                    // 碰撞圆的半径
                    // 记得改这里
                    let r = Math.sqrt(2) / 2 * a + this.width / 2;
                    // 循环判断周围格点
                    let k1 = Math.max(0, Math.ceil(x - r)), k2 = Math.min(width, Math.floor(x + r));
                    let l2 = height - Math.max(0, Math.ceil(y - r));
                    let l1 = height - Math.min(height, Math.floor(y + r));
                    for(let k=k1; k<=k2; k++){
                        for(let l=l1; l<=l2; l++){
                            let x2 = k, y2 = height - l;
                            let dis = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
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

    path(from: cc.Vec2, to: cc.Vec2){
        let start: cc.Vec2 = this.getNearestPoint(from), end: cc.Vec2 = this.getNearestPoint(to);
        let path = this.findPath(start, end);
        path.unshift(from);
        path.push(to);
        this.shortenPath(path);
    }

    getNearestPoint(from: cc.Vec2): cc.Vec2 {
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
        let graphic: cc.Graphics = this.node.getComponent(cc.Graphics);

        graphic.strokeColor = graphic.strokeColor.set(cc.Color.RED);
        graphic.circle(from.x, from.y, 10);
        graphic.circle(to.x, to.y, 10);
        graphic.stroke();

        graphic.strokeColor = graphic.strokeColor.set(cc.Color.GREEN);
        graphic.moveTo(from.x, from.y);
        graphic.lineTo(to.x, to.y);
        graphic.stroke();
    }

    update (dt) {
        ;
    }
}
