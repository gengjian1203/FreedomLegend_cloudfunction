// 云函数入口文件
const cloud = require('wx-server-sdk');

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: 'production-ojwyp'
});

const db = cloud.database();
const arrName = ['练手木人', '江湖宵小', '呆瓜小贼', '楞头菜鸟', '黑胖武者', 
                 '白眉老人', '高大武者', '知名侠客', '一代宗师', '武林巨擘', '江湖神话', '超凡脱俗'];
// let _id = '';
// let _openid = '';


// 获取不重复的排名列表（1~5名固定，剩余取自身附近1000名中随机10位）
function getSportsNumber(nNumberSelf) {
  const nLevel = Math.floor(Math.abs(nNumberSelf - 500) / 1000);
  const nBaseNumber = nLevel * 1000;
  let arrSportsNumber = new Set([1, 2, 3, 4, 5]);
  let arrResult = [];

  while (arrSportsNumber.size < 15) {
    const tmpRandNumber = nBaseNumber + Math.floor(Math.random() * 1000);
    arrSportsNumber.add(tmpRandNumber);
  }

  arrResult = Array.from(arrSportsNumber);
  return arrResult;
}

// 创建比武机器人
function createSportRobot(nRobotNumber) {
  // const level = Math.abs(100 - Math.floor(nRobotNumber / 100));
  const level = 0;
  const objResult = {
    _id: `sport-${nRobotNumber}`, 
    sportsNumber: nRobotNumber, 
    nickName: arrName[Math.floor(level / 10)] ? arrName[Math.floor(level / 10)] : '神秘黑影', 
    level: level, 
    hp_total: level * 50 + 100, 
    outerAttack_total: level * 10 + 20, 
    innerAttack_total: level * 10 + 10, 
    outerDefense_total: level * 1 + 10, 
    innerDefense_total: level * 1 + 0, 
    crit_total: 0, 
    dodge_total: 0, 
    speed_total: level, 
    understand_total: 0,
  }
  return objResult;
}

//////////////////////////////////////////////////
// querySportsList
// 查询符合自身排名的演武场对手列表
// param 
// sportsNumber: Number     自身演武场排名
// return
// result: Boolean          接口成功标识
// arrSportsList: Object    演武场对手列表
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  // _openid = event.openid !== undefined ? event.openid : cloud.getWXContext().OPENID;
  // _id = `mem-${_openid}`;
  
  const nNumberSelf = event.sportsNumber ? event.sportsNumber : 9999;
  let result = true;
  let arrSportsList = [];
  let arrSportsNumber = getSportsNumber(nNumberSelf);

  console.log('querySportsList', arrSportsNumber);
  try {
    const member = await db.collection('member')
                           .where({
                             "sportsNumber": {
                               "$in": arrSportsNumber
                             }
                           }).get();
    console.log('mongodb.', member.data);
    // 补全机器人
    for (item of arrSportsNumber) {
      const nIndex = member.data.findIndex((element) => {
        return element.sportsNumber === item;
      })
      if (nIndex === -1) {
        // 没找到
        console.log('arrSportsNumer', item, '不存在，补全机器人');
        member.data.push(createSportRobot(item));
      } else {
        // 存在
        console.log('arrSportsNumer', item, '存在人物');
      }
    }
    // 排序
    arrSportsList = member.data.sort((objMemberA, objMemberB) => {
      return objMemberA.sportsNumber - objMemberB.sportsNumber;
    })

  } catch (e) {
    // 没有查到。异常。
    result = false;
    console.log('queryMember error', e);
  }

  return {
    result: result,
    arrSportsList: arrSportsList,
  }
}