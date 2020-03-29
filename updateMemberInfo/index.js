// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 可在入口函数外缓存 db 对象
const db = cloud.database();
let _id = '';
let _openid = '';

// 生成满足正态分布的随机数
function randomNormalDistribution() {
  var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
  do {
    //获得两个（-1,1）的独立随机变量
    u = Math.random() * 2 - 1.0;
    v = Math.random() * 2 - 1.0;
    w = u * u + v * v;
  } while (w == 0.0 || w >= 1.0)
  //这里就是 Box-Muller转换
  c = Math.sqrt((-2 * Math.log(w)) / w);
  //返回2个标准正态分布的随机数，封装进一个数组返回
  //当然，因为这个函数运行较快，也可以扔掉一个
  //return [u*c,v*c];
  return u * c;
}

// 生成满足正态分布的随机数 基础值50，标准差13
// getNumberInNormalDistribution
function getNumberInNormalDistribution(mean, std_dev) {
  return mean + (randomNormalDistribution() * std_dev);
}

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
  member.avatarUrl = newInfo.avatarUrl; // 头像url
  member.nickName = newInfo.nickName; // 姓名
  member.title = ''; // 称号
  member.describe = getNumberInNormalDistribution(50, 13) // 描述
  member.level = 0; // 等级
  member.exp = 0; // 经验
  member.money = 0; // 铜钱
  member.gold = 0; // 元宝
  // 属性展示
  member.hp = 100; // 生命
  member.outerAttack = 20; // 外功
  member.innerAttack = 10; // 内功
  member.outerDefense = 10; // 外防
  member.innerDefense = 0; // 内防
  member.crit = 0; // 暴击率
  member.dodge = 0; // 闪避率
  member.block = 0; // 格挡率
  member.lucky = 0; // 幸运值

  // 创建配件表基本信息
  parts._id = member._partsid; // 配件表ID
  parts.mail = []; // 邮件列表
  parts.equipment = []; // 装备列表
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

// 云函数入口函数
exports.main = async (event, context) => {
  _openid = cloud.getWXContext().OPENID;
  _id = `mem-${_openid}`;

  const newInfo = event.memberInfo;
  const isLogin = event.isLogin;
  let result = true;
  let timeHook = 0;
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
    timeHook
  }
}