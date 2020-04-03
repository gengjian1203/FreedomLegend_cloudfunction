// 云函数入口文件
const cloud = require('wx-server-sdk');

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

//////////////////////////////////////////////////
// queryGameDetail
// 查询游戏的全局信息
// param 
// return
// result: Boolean      接口成功标识
// game: Object         游戏信息对象
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  let result = true;
  let game = null;

  try {
    game = await db.collection('global').get();
  } catch (e) {
    // 没有查到。异常。
    result = false;
    console.log('query global error', e);
  }

  return {
    result: result,
    game: game,
  }
}