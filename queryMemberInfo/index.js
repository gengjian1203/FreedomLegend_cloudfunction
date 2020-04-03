// 云函数入口文件
const cloud = require('wx-server-sdk');

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
let _id = '';
let _openid = '';

//////////////////////////////////////////////////
// queryMemberInfo
// 查询角色信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// return
// result: Boolean      接口成功标识
// member: Object       成员信息对象
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  _id = `mem-${_openid}`;
  
  let result = true;
  let member = {};

  try {
    member = await db.collection('member')
                     .doc(_id)
                     .get();
  } catch (e) {
    // 没有查到。异常。
    result = false;
    console.log('queryMember error', e);
  }

  return {
    result: result,
    member: member,
  }
}