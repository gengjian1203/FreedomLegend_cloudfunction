// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 可在入口函数外缓存 db 对象
const db = cloud.database();
let _id = '';
let _openid = '';


// 创建成员信息
createMember = async (newInfo) => {
  let member = {};
  let parts = {};
  // 创建基本信息
  // 系统级
  member._id = _id;
  member._partsid = `parts-${_openid}`; // 配件表ID
  member._openid = _openid;
  member._createTime = db.serverDate();    // 创建时间
  member._loginTime = db.serverDate();    // 创建时间
  member._updateTime = db.serverDate();    // 修改时间
  // 外部展示
  member.avatarUrl = newInfo.avatarUrl; // 头像url
  member.nickName = newInfo.nickName; // 姓名
  member.level = 1; // 等级
  member.exp = 0; // 经验
  member.vip = 0; // 会员等级
  member.vip_exp = 0; // 会员经验
  member.money = 0; // 铜钱
  member.gold = 0; // 元宝
  // 属性展示
  member.hp = 100; // 生命
  member.attack = 20; // 攻击
  member.defense = 0; // 防御
  member.dodge = 0; // 闪避

  // 创建配件表基本信息
  parts._id = member._partsid; // 配件表ID
  parts.equipment = []; // 装备列表
  parts.consumables = []; // 消耗品列表
  parts.magic = []; // 功法列表
  parts.pets = []; // 宠物列表


  // 创建新的玩家信息
  try {
    await db.collection('member').add({
      data: member
    });
    await db.collection('parts').add({
      data: parts
    });
  } catch (e) {
    console.log('createMember error.', e);
  }
}

// 更新成员信息
updateMemberInfo = async (newInfo, oldInfo, isLogin) => {
  data = { ...oldInfo.data, ...newInfo };
  // 除去id与openid
  delete data['_id'];

  // 更新操作时间
  if (isLogin) {
    data._loginTime = db.serverDate();    // 登录时间
  } 
  data._updateTime = db.serverDate();   // 更新时间
  
  console.log('newInfo', data);

  // 更新用户信息
  try {
    await db.collection('member')
            .doc(_id)
            .set({
              data
            });
  } catch (e) {
    console.log('updateMemberInfo error.', e);
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  _openid = cloud.getWXContext().OPENID;
  _id = `mem-${_openid}`;

  const newInfo = event.memberInfo;
  const isLogin = event.isLogin;
  let result = true;
  let oldInfo = null;

  // 确认是否有数据
  try {
    oldInfo = await db.collection('member')
                      .doc(_id)
                      .get();
  } catch(e) {
    // 之前没有数据
    console.log('main query oldInfo error.', e);
  }

  // 进行处理
  try {
    console.log('createMember oldInfo', oldInfo)
    if (oldInfo === null) {
      // 创建玩家信息
      await createMember(newInfo);
    } else {
      // 更新玩家信息
      await updateMemberInfo(newInfo, oldInfo, isLogin);
    }
  } catch (e) {
    result = false;
    console.log('main update memberInfo error.', e);
  }

  return {
    result: result,
  }
}