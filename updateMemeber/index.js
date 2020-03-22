// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 可在入口函数外缓存 db 对象
const db = cloud.database();

// 创建成员信息
createMember = async (openId, newInfo) => {
  let data = {};
  // 系统级
  data._openid = openId;
  data.createTime = db.serverDate();    // 创建时间
  data.loginTime = db.serverDate();    // 创建时间
  data.updateTime = db.serverDate();    // 修改时间
  // 外部展示
  data.avatarUrl = newInfo.avatarUrl; // 头像url
  data.nickName = newInfo.nickName; // 姓名
  data.level = 1; // 等级
  data.exp = 0; // 经验
  data.vip = 0; // 会员等级
  data.vip_exp = 0; // 会员经验
  data.money = 0; // 铜钱
  data.gold = 0; // 元宝
  // 属性展示
  data.hp = 100; // 生命
  data.attack = 20; // 攻击
  data.defense = 0; // 防御
  data.dodge = 0; // 闪避

  // 创建新的用户记录
  try {
    await db.collection('member').add({
      data
    });
  } catch (e) {
    console.log('createMember error.', e);
  }
}

// 更新成员信息
updateMemberInfo = async (openId, newInfo, oldInfo, isLogin) => {
  let data = oldInfo;
  // 除去id与openid
  delete data['_id'];
  delete data['_openid'];

  // 更新操作时间
  if (isLogin) {
    data.loginTime = db.serverDate();    // 登录时间
  } 
  data.updateTime = db.serverDate();   // 更新时间
  // 将待更新数据放入data
  for (let key in newInfo) {
    data[key] = newInfo[key];
  }

  // 更新用户信息
  try {
    await db.collection('member')
            .where({
              _openid: openId
            })
            .update({
              data
            });
  } catch (e) {
    console.log('updateMemberInfo error.', e);
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  // 
  const openId = cloud.getWXContext().OPENID;
  const newInfo = event.memberInfo;
  const isLogin = event.isLogin;
  let result = true;
  let oldInfo = null;

  // 确认是否有数据
  try {
    oldInfo = await db.collection('member')
                         .where({
                           _openid: openId
                         }).get();
  } catch(e) {
    // 之前没有数据
    console.log('main query oldInfo error.', e);
  }

  // 进行处理
  try {
    if (oldInfo.data.length === 0) {
      // 创建用户信息
      console.log('createMember oldInfo', oldInfo)
      await createMember(openId, newInfo);
    } else {
      // 更新用户信息
      console.log('updateMemberInfo oldInfo', oldInfo)
      console.log('updateMemberInfo newInfo', newInfo)
      await updateMemberInfo(openId, newInfo, oldInfo.data[0], isLogin);
    }
  } catch (e) {
    result = false;
    console.log('main update memberInfo error.', e);
  }

  return {
    result: result,
  }
}