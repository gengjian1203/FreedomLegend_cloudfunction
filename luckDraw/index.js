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

// 随机获取装备抽奖信息
// 5%   白银装备
// 10%  白银碎片 * 5
// 30%  青铜装备
// 55%  青铜碎片 * 5
getRandomBox = async () => {
  const nRandom = Math.floor(Math.random() * 100);
  const objPrice = {};

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

// 将信息存入数据库
savePrize = async (prize) => {
  try {
    await db.collection('parts').doc(_id).update({
      data: {
        equipment: _.push(prize)
      }
    });
  } catch (e) {
    console.log('存数据库 error.', e);
  }
}

//////////////////////////////////////////////////
// luckDraw
// 幸运抽奖
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: String         'box' - 装备抽奖  'roll' - 轮盘抽奖 '' - 功法抽奖
// count: Number        抽奖次数
// return
// result: Boolean      接口成功标识
// prize: Array         [{id:'',total:5}] 物品ID 物品数量
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `parts-${_openid}`;
  const type = event.type;
  const count = event.count !== undefined ? event.count : 1;

  let result = true;
  let prize = [];

  // 随机抽奖
  try {
    switch (type) {
      case 'box':
        for (let i = 0; i < count; i++) {
          const tmpPrize = await getRandomBox();
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

  // 奖品存入个人所属信息
  try {
    await savePrize(prize);
  } catch (e) {
    result = false;
    console.log('存入个人error.', e);
  }

  return {
    result,
    prize
  }

}