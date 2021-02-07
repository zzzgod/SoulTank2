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

    map: cc.TiledMap = null;

    onLoad () {
        let manager = cc.director.getPhysicsManager();
        let Bits = cc.PhysicsManager.DrawBits;
        manager.enabled = true;
        manager.debugDrawFlags = Bits.e_shapeBit;
        manager.gravity = cc.v2();
        this.map = this.node.getComponent(cc.TiledMap);
    }

    start () {
        let size: cc.Size = this.map.getTileSize();
        let block: cc.TiledLayer = this.map.getLayer('wall');
        let layerSize: cc.Size = block.getLayerSize();
        
        for(let i=0; i<layerSize.width; i++){
            for (let j = 0; j < layerSize.height; j++) {
                let tile = block.getTiledTileAt(i, j, true);
                if(tile.gid != 0){
                    tile.node.group = 'wall';
                    let body = tile.node.addComponent(cc.RigidBody);
                    let collider = tile.node.addComponent(cc.PhysicsBoxCollider);

                    body.type = cc.RigidBodyType.Static;
                    collider.offset = cc.v2(size.width / 2, size.height / 2);
                    collider.size = size;
                    collider.apply();
                }
                
            }
        }
    }

    // update (dt) {}
}
