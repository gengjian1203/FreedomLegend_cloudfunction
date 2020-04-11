// 云函数入口文件
const cloud = require('wx-server-sdk');

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 可在入口函数外缓存 db 对象
const db = cloud.database();
let _id = '';
let _openid = '';

// // 生成满足正态分布的随机数
// function randomNormalDistribution() {
//   var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
//   do {
//     //获得两个（-1,1）的独立随机变量
//     u = Math.random() * 2 - 1.0;
//     v = Math.random() * 2 - 1.0;
//     w = u * u + v * v;
//   } while (w == 0.0 || w >= 1.0)
//   //这里就是 Box-Muller转换
//   c = Math.sqrt((-2 * Math.log(w)) / w);
//   //返回2个标准正态分布的随机数，封装进一个数组返回
//   //当然，因为这个函数运行较快，也可以扔掉一个
//   //return [u*c,v*c];
//   return u * c;
// }

// // 生成满足正态分布的随机数 基础值50，标准差13
// // getNumberInNormalDistribution
// function getNumberInNormalDistribution(mean, std_dev) {
//   return mean + (randomNormalDistribution() * std_dev);
// }

// 创建成员信息
createMember = async (newInfo) => {
  const dataServer = db.serverDate();
  let member = {};
  let parts = {};
  // 创建基本信息
  // 系统级
  member._id = _id;
  member._partsid = `parts-${_openid}`; // 配件表ID
  member._openid = _openid;
  member._createTime = dataServer;    // 创建时间
  member._loginTime = dataServer;    // 登录时间
  member._updateTime = dataServer;    // 修改时间
  member.timeLogin = new Date().getTime();    // 登录时间.getTime()
  // 外部展示
  member.title = ''; // 称号
  member.describe = Math.floor(Math.random() * 100); // 描述 0 ~ 100
  member.level = 0; // 等级
  member.exp = 0; // 经验
  member.money = 0; // 铜钱
  member.gold = 0; // 元宝
  // 身穿装备
  member.equipment_hat = {}; // 头戴
  member.equipment_shoulder = {}; // 肩披
  member.equipment_jacket = {}; // 身穿
  member.equipment_weapon = {}; // 手持
  member.equipment_jewelry = {}; // 腰悬
  member.equipment_shoes = {}; // 足踏
  // 基础属性
  member.hp_base = 100; // 生命
  member.outerAttack_base = 20; // 外功
  member.innerAttack_base = 10; // 内功
  member.outerDefense_base = 10; // 外防
  member.innerDefense_base = 0; // 内防
  member.crit_base = 0; // 暴击率
  member.dodge_base = 0; // 闪避率
  member.speed_base = 0; // 速度
  member.understand_base = Math.floor(Math.random() * 100); // 悟性
  // 装备属性
  member.hp_equipment = 0; // 生命
  member.outerAttack_equipment = 0; // 外功
  member.innerAttack_equipment = 0; // 内功
  member.outerDefense_equipment = 0; // 外防
  member.innerDefense_equipment = 0; // 内防
  member.crit_equipment = 0; // 暴击率
  member.dodge_equipment = 0; // 闪避率
  member.speed_equipment = 0; // 速度
  member.understand_equipment = 0; // 悟性
  // 丹药属性
  member.hp_medicine = 0; // 生命
  member.outerAttack_medicine = 0; // 外功
  member.innerAttack_medicine = 0; // 内功
  member.outerDefense_medicine = 0; // 外防
  member.innerDefense_medicine = 0; // 内防
  member.crit_medicine = 0; // 暴击率
  member.dodge_medicine = 0; // 闪避率
  member.speed_medicine = 0; // 速度
  member.understand_medicine = 0; // 悟性
  // 整体属性
  member.hp_total = member.hp_base + member.hp_equipment + member.hp_medicine; // 生命
  member.outerAttack_total = member.outerAttack_base + member.outerAttack_equipment + member.outerAttack_medicine;  // 外功
  member.innerAttack_total = member.innerAttack_base + member.innerAttack_equipment + member.innerAttack_medicine;  // 内功
  member.outerDefense_total = member.outerDefense_base + member.outerDefense_equipment + member.outerDefense_medicine; // 外防
  member.innerDefense_total = member.innerDefense_base + member.innerDefense_equipment + member.innerDefense_medicine; // 内防
  member.crit_total = member.crit_base + member.crit_equipment + member.crit_medicine;  // 暴击率
  member.dodge_total = member.dodge_base + member.dodge_equipment + member.dodge_medicine; // 闪避率
  member.speed_total = member.speed_base + member.speed_equipment + member.speed_medicine; // 速度
  member.understand_total = member.understand_base + member.understand_equipment + member.understand_medicine; // 悟性

  // 解构赋值 如：头像url、姓名、性别 0 - 未知 1 - 男 2 - 女
  member = { ...member, ...newInfo };

  // 创建配件表基本信息
  parts._id = member._partsid; // 配件表ID
  parts.mail = []; // 邮件列表
  parts.equipment = []; // 装备列表
  parts.medicine = []; // 药品列表
  parts.consumables = []; // 消耗品列表
  parts.magic = []; // 功法列表
  parts.pets = []; // 宠物列表
  parts.title = []; // 称号列表
  parts.log = []; // 人物传记列表

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
  const dataServer = db.serverDate();
  const data = { ...oldInfo.data, ...newInfo };
  // 除去id与openid
  delete data['_id'];

  // 更新操作时间
  if (isLogin) {
    data._loginTime = dataServer;             // 登录时间
    data.timeLogin = new Date().getTime();    // 登录时间.getTime()
  } 
  data._updateTime = dataServer;              // 更新时间
  
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

//////////////////////////////////////////////////
// updateMemeberInfo
// 更新/创建的角色信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// memberInfo: Object   成员信息
// isLogin: Boolean     是否是登录相关请求
// return
// result: Boolean      接口成功标识
// timeHook: Number     挂机时间
// isNewMember: Boolean 是否是新成员标识、决定跳转引导页还是主页面
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `mem-${_openid}`;

  const newInfo = event.memberInfo;
  const isLogin = event.isLogin;

  let oldInfo = null;
  let result = true;          // 接口是否调用成功
  let timeHook = 0;           // 挂机时间
  let isNewMember = false;    // 是否为新用户

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
      isNewMember = true;
      // 创建玩家信息
      await createMember(newInfo);
    } else {
      isNewMember = false;
      // 更新玩家信息
      await updateMemberInfo(newInfo, oldInfo, isLogin);
      // 计算挂机时间
      if (isLogin) {
        const nowTime = new Date().getTime();
        timeHook = nowTime - oldInfo.data.timeLogin;
      }
    }
  } catch (e) {
    result = false;
    console.log('main update memberInfo error.', e);
  }

  return {
    result,
    timeHook,
    isNewMember
  }
}