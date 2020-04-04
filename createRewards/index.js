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

// 生成UUID
const getUUID = () => {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
 
  let uuid = s.join("");
  return uuid;
}

// 随机获取装备抽奖信息
// 5%   白银装备
// 10%  白银碎片 * 5
// 30%  青铜装备
// 55%  青铜碎片 * 5
getRandomBox = async (type) => {
  const nRandom = Math.floor(Math.random() * 100);
  const objPrice = {};

  objPrice._id = getUUID();
  objPrice.time = new Date().getTime();
  objPrice.type = type;
  if (nRandom < 5) {
    objPrice.id = `100600`;
    objPrice.total = 1;
  } else if (nRandom < 15) {
    objPrice.id = `100601`;
    objPrice.total = 5;
  } else if (nRandom < 45) {
    const nPosition = Math.floor(Math.random() * 6);
    objPrice.id = `1003${nPosition}0`;
    objPrice.total = 1;
  } else {
    const nPosition = Math.floor(Math.random() * 6);
    objPrice.id = `1003${nPosition}1`;
    objPrice.total = 5;
  }
  
  return objPrice;
}

// 合并对象数组()
mergeObject = (arr) => {
  let newArr = []
  arr.forEach((el) => {
    let result = 0;
    if (parseInt(el.id) % 10 === 0) {
      result = -1;
    } else {
      result = newArr.findIndex((ol) => { 
        return el.id === ol.id
      });
    }
    if (result !== -1) {
      newArr[result].total = newArr[result].total + el.total;
    } else {
      newArr.push(el);
    }
  });
  return newArr;
}

// 将信息存入数据库
savePrize = async (prize) => {
  try {
    const res = await db.collection('parts')
                        .doc(_id)
                        .get();
    // console.log('savePrize1', res.data.equipment);
    const arrSum = prize.concat(res.data.equipment);
    // console.log('savePrize2', arrSum);
    const arrData = mergeObject(arrSum);
    // console.log('savePrize3', arrData);
    const res11 = await db.collection('parts')
                          .doc(_id)
                          .update({
                            data: {
                              equipment: arrData
                            }
                          });
    
  } catch (e) {
    console.log('存数据库 error.', e);
  }
}

// 测试参数
// {
//   "openid": "oxeKH5LuhzyrivQIJI54h9it3MA4",
//   "type": "box",
//   "count": 10
// }

//////////////////////////////////////////////////
// getRewards
// 获取奖励
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: String         'box' - 装备抽奖  'roll' - 轮盘抽奖 '' - 功法抽奖
// count: Number        抽奖次数
// return
// result: Boolean      接口成功标识
// prize: Array         [{_id:'', id:'', total:5, time:0}] 物品UUID唯一标识 物品ID 物品数量 创建时间戳
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `parts-${_openid}`;
  const type = event.type;
  const count = event.count !== undefined ? event.count : 1;

  let result = true;
  let prize = [];
  let arrCreatePrize = [];

  // 随机抽奖
  try {
    switch (type) {
      case 'box':
        for (let i = 0; i < count; i++) {
          const tmpPrize = await getRandomBox(type);
          prize.push(tmpPrize);
        }
        break;
      case 'roll':

        break;
      default:

        break;
    }
  } catch (e) {
    result = false;
    console.log('随机抽奖error.', e);
  }

  // 深拷贝
  arrCreatePrize = JSON.parse(JSON.stringify(prize));

  // 奖品存入个人所属信息
  try {
    await savePrize(prize);
  } catch (e) {
    result = false;
    console.log('存入个人error.', e);
  }

  return {
    result,
    prize: arrCreatePrize
  }

}