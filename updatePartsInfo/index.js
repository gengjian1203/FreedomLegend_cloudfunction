// 云函数入口文件
const cloud = require('wx-server-sdk');

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


//////////////////////////////////////////////////
// updatePartsInfo
// 更新/创建的配件信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// partsInfo: Array     物品信息
// partsType: String    配件列表名称
// return
// result: Boolean      接口成功标识
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `parts-${_openid}`;

  const objInfo = event.partsInfo;
  const strType = event.partsType;

  let result = true;                  // 接口是否调用成功

  try {
    const res = await db.collection('parts')
                        .doc(_id)
                        .update({
                          data: {
                            [strType]: _.set(objInfo)
                          }
                        });
  } catch(e) {
    result = false;
    console.log('main update updatePartsInfo error.', e);
  }

  return {
    result
  }
}