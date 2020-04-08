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

// 查询角色拥有的配件数据信息
queryPartsInfo = async() => {
  const res = await db.collection('parts')
                      .doc(_id)
                      .get();

  return res.data;
}

// 查询资料库获取完整信息
queryPartsInfoComplete = async(arrPartsInfo, arrType) => {
  const arrResult = {};
  try {
    // 查询所有
    const res = await db.collection('databasePartsInfo').get();
    const arrDatabase = res.data;
    // 逐个完善物品信息
    for (let i = 0; i < arrType.length; i++) {
      for (let j = 0; j < arrPartsInfo[arrType[i]].length; j++) {
        const nIndex = arrDatabase.findIndex((item) => {
          return (item._id === arrPartsInfo[arrType[i]][j].id);
        })
        if (nIndex >= 0) {
          // 解构赋值
          arrResult[arrType[i]] = arrResult[arrType[i]] ? arrResult[arrType[i]] : [];
          arrResult[arrType[i]].push({...arrDatabase[nIndex], ...arrPartsInfo[arrType[i]][j]});
        }
      }
    }
  } catch (e) {
    console.log('queryPartsInfoComplete Error', e);
  }
  return arrResult;
}

// 测试参数
// {
//   "openid": "oxeKH5LuhzyrivQIJI54h9it3MA4",
//   "type": ['equipment', 'mail', 'log']
// }

//////////////////////////////////////////////////
// queryPartsInfo
// 查询角色的附属数据信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: Array          ['equipment', 'mail'] 'equipment' - 装备, 'magic' - 功法, 'medicine' - 丹药, 'other' - 其他, 'mail' - 邮件
// return
// result: Boolean      接口成功标识
// partsInfo: Array     [{_id:'', id:'', total:5, time:0}] 物品UUID唯一标识 物品ID 物品数量 创建时间戳
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `parts-${_openid}`;
  const arrType = event.type;

  let result = true;
  let partsInfo = [];
  let arrPartsInfo = [];

  // 查询指定信息
  try {
    partsInfo = await queryPartsInfo();
  } catch (e) {
    result = false;
    console.log('查询指定信息 err.', e);
  }
  if (partsInfo) {
    // 查询资料库获取完整信息
    arrPartsInfo = await queryPartsInfoComplete(partsInfo, arrType);
  }

  return {
    result,
    arrPartsInfo
  }
}