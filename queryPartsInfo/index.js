// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 可在入口函数外缓存 db 对象
const db = cloud.database();
const _ = db.command;

let _id = '';
let _openid = '';

// 查询角色拥有的所有装备相关道具
queryPartsForType = async(type) => {
  const res = await db.collection('parts')
                      .doc(_id)
                      .field({
                        [type]: true,
                      })
                      .get();

  return res.data[type];
}

// 查询资料库获取完整信息
queryPartsInfoComplete = async(partsInfo) => {
  for (let i = 0; i < partsInfo.length; i++) {
    const item = partsInfo[i];
    try {
      const res = await db.collection('database_equipment')
                          .doc(item.id)
                          .get();
      // 除去_id
      delete res.data['_id'];
      // 解构赋值
      partsInfo[i] = {...item, ...res.data};
    } catch (e) {
      console.log('queryPartsInfoComplete Error', e);
    }
  }
}

//////////////////////////////////////////////////
// queryPartsInfo
// 查询角色的附属数据信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: String         'equipment' - 装备, 'magic' - 功法, 'medicine' - 丹药, 'other' - 其他
// return
// result: Boolean      接口成功标识
// prize: Array         [{_id:'', id:'', total:5, time:0}] 物品UUID唯一标识 物品ID 物品数量 创建时间戳
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `parts-${_openid}`;
  const type = event.type;

  let result = true;
  let partsInfo = [];

  // 查询指定信息
  try {
    partsInfo = await queryPartsForType(type);
  } catch (e) {
    result = false;
    partsInfo = [];
    console.log('查询指定信息 err.', e);
  }
  if (partsInfo) {
    // 查询资料库获取完整信息
    await queryPartsInfoComplete(partsInfo);
  }

  return {
    result,
    partsInfo
  }
}