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

// 将邮件奖励存入数据库
sendPrizeMail = async () => {
  const arrWeekString = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const arrWeekContent = ['越努力越幸运，生活其实很好，就差你给自己一个微笑。', 
                          '每天早上醒来，看见你和阳光都在，那就是我想要的未来。新的一周，新的开始。',
                          '做一个幸福的人，关心身体和心情，成为最好的自己。',
                          '山是水的故事，云是风的故事，而你是我的故事~',
                          '多谢你如此精彩耀眼的陪伴，做我平淡岁月里的星辰。',
                          '你的陪伴像是四月早天里的云烟，黄昏吹着风的软，星子在无意中闪，细雨点洒在花前。',
                          '世界曾经颠倒黑白 ,如今回归绚丽色彩。世界曾经失去声响，如今有你们陪我唱歌。',
                          '生活，总会有不期而遇的温暖，和生生不息的希望。']
  const date = new Date();
  const strContent = `今天是` + 
                     `${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日。${arrWeekString[date.getDay() % 7]}\n` + 
                     `${arrWeekContent[date.getDay() % 7]}\n` + 
                     `早安~`;

  try {
    const res = await db.collection('parts')
                        .where({
                          _id: db.command.exists(true)
                        })
                        .update({
                          data: {
                            mail: db.command.push([{
                              time: db.serverDate(),
                              strFrom: '梦梦',
                              strContent: strContent,
                              arrGifts: [{
                                id: '000001',
                                total: 1500,
                              }, {
                                id: '000002',
                                total: 8888,
                              }, {
                                id: '101531',
                                total: 20,
                              }]
                            }])
                          }
                        });
  } catch (e) {
    console.log('将邮件奖励存入数据库 error.', e);
  }
}

//////////////////////////////////////////////////
// createPrizeMail
// 定时创建奖励邮件
// param 
// return
// result: Boolean      接口成功标识
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  let result = true;

  // 奖品存入个人所属信息
  try {
    await sendPrizeMail();
  } catch (e) {
    result = false;
    console.log('存入个人error.', e);
  }

  return {
    result
  }
}