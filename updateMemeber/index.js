// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 可在入口函数外缓存 db 对象
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // 
  const openId = cloud.getWXContext().OPENID;
  let result = true;
  let memberInfo = null;

  // 确认是否有数据
  try {
    memberInfo = await db.collection('member').doc(openId).get();
  } catch(e) {
    // 之前没有数据
    console.log('query memberInfo error.', e);
  }
  try {
    console.log('memberInfo', memberInfo);
    if (!memberInfo) {
      // 创建新的用户记录
      await db.collection('member').add({
        data: {
          // 不指定_id，数据库会默认生成一个
          // 用户的openId
          _openid: openId,
          // 外部展示
          // 等级
          level: 1,
          // 经验
          exp: 0,
          // 会员等级
          vip: 0,
          // 会员经验
          vip_exp: 0,
          // 铜钱
          money: 0,
          // 元宝
          gold: 0,
          // 属性展示
          // 生命
          hp: 100,
          // 攻击
          attack: 20,
          // 防御
          defense: 0,
          // 闪避
          dodge: 0,
        }
      });
    } else {
      // 更新用户信息
    }
  } catch (e) {
    result = false;
    console.log('update memberInfo error.', e);
  }

  return {
    result: result,
  }
}