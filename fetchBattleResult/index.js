// 云函数入口文件
const cloud = require('wx-server-sdk');

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 找到对手目标（当前策略，优先攻击对方存活的，且速度最快的）
function findOpponent(arrListMemberInfoSort, bSelf) {
  return arrListMemberInfoSort.findIndex((item) => {
    return ((item.bFriends === !bSelf) && (item.hp_total > 0));
  });
}

// 检查是否团灭
function checkCampDown(arrListMemberInfoSort) {
  let bFriendsFlag = true;    // 友军团灭标识
  let bOpponentFlag = true;   // 敌军团灭标识

  for (let item of arrListMemberInfoSort) {
    if (item.hp_total > 0) {
      if (item.bFriends) {
        bFriendsFlag = false;
      } else {
        bOpponentFlag = false;
      }
      // 如果双方都有存活角色，则不再判断了
      if (!bFriendsFlag && !bOpponentFlag) {
        return false;
      }
    }
  }

  return (bFriendsFlag || bOpponentFlag);
}

// 经历一轮的战斗
// bEnv: true - 外功阳阵 false - 内功阴阵
function funBattleRound(arrListResult, arrListMemberInfoSort, nRound) {
  const bEnv = nRound % 2 === 0;
  console.log('funBattleRound', arrListMemberInfoSort);
  
  for (let index in arrListMemberInfoSort) {
    const item = arrListMemberInfoSort[index];
    // 如果进攻者已经倒下则换下个人
    if (item.hp_total <= 0) {
      continue;
    }

    const nIndexAttack = index; // 进攻者index
    const nIndexDefense = findOpponent(arrListMemberInfoSort, item.bFriends); // 防守者index
    
    console.log('funBattleRound', nIndexAttack, nIndexDefense);

    // 攻击者攻击值
    const nNumAttack = bEnv ? item.outerAttack_total : item.innerAttack_total;
    // 防御者防御值
    const nNumDefense = bEnv ? arrListMemberInfoSort[nIndexDefense].outerDefense_total : arrListMemberInfoSort[nIndexDefense].innerDefense_total;


    // 对攻击者的影响
    const nEffectAttack = 0;
    // 对防御者的影响
    const nEffectDefense = (nNumDefense - nNumAttack < 0) ? nNumDefense - nNumAttack : 0;

    // 攻击者血量
    arrListMemberInfoSort[nIndexAttack].hp_total += nEffectAttack;
    // 防御者血量
    arrListMemberInfoSort[nIndexDefense].hp_total += nEffectDefense;

    // 本次攻击的结果，压入队列。
    const objResult = {
      nRound: nRound,                                           // 回合数
      strIDAttack: arrListMemberInfoSort[nIndexAttack]._id,     // 进攻者ID
      strIDDefense: arrListMemberInfoSort[nIndexDefense]._id,   // 防御值ID
      nEffectAttack: nEffectAttack,                             // 对攻击者的影响
      nEffectDefense: nEffectDefense,                           // 对防御者的影响
      nHPAttack: arrListMemberInfoSort[nIndexAttack].hp_total,  // 攻击者结果HP
      nHPDefense: arrListMemberInfoSort[nIndexDefense].hp_total, // 防御者结果HP
    };
    console.log('objResult', objResult);

    arrListResult.push(objResult);

    // 如果本次攻击出现伤亡，则检验是否有团灭
    if((arrListMemberInfoSort[nIndexAttack].hp_total <= 0) || (arrListMemberInfoSort[nIndexDefense].hp_total <= 0)) {
      // 如果团灭战斗结束
      if (checkCampDown(arrListMemberInfoSort)) {
        return true;
      }
    }
  }

  return false;
}

// 获取战斗结果
function getBattleResult(arrListMemberInfoSort) {
  let nHPFriend = 0;
  let nHPOpponent = 0;
  
  arrListMemberInfoSort.forEach((item) => {
    if (item.bFriends) {
      nHPFriend += item.hp_total;
    } else {
      nHPOpponent += item.hp_total;
    }
  });

  console.log('getBattleResult', nHPFriend, nHPOpponent);

  return nHPFriend > nHPOpponent;
}

// 战斗主函数
function funBattle(arrMemberInfoA, arrMemberInfoB) {
  let arrListResult = [];
  const nLengthA = arrMemberInfoA.length;
  const nLengthB = arrMemberInfoB.length;
  // 分组阵营
  arrMemberInfoA.map((item) => {
    return item.bFriends = true;
  });
  arrMemberInfoB.map((item) => {
    return item.bFriends = false;
  });
  const arrListMemberInfo = arrMemberInfoA.concat(arrMemberInfoB);
  const arrListMemberInfoSort = arrListMemberInfo.sort((objA, objB) => {
    return objB.speed_total - objA.speed_total;
  })

  console.log('arrListMemberInfoSort', arrListMemberInfoSort)
  // 10回合
  for (var i = 0; i < 20; i++) {
    if (funBattleRound(arrListResult, arrListMemberInfoSort, i)) {
      break;
    }
  }
  // 血量比拼
  const bWin = getBattleResult(arrListMemberInfoSort);

  // 打印战斗日志
  console.log('funBattle', bWin, arrListResult);
  return {
    bWin,
    arrListResult,
  }
}

// 测试参数
// {
//   "arrMemberInfoA": [{
//     "_id": "mem-aaaaaaa",
//     "hp_total": 300,
//     "outerAttack_total": 20,
//     "innerAttack_total": 10,
//     "outerDefense_total": 5,
//     "innerDefense_total": 3,
//     "crit_total": 0,
//     "dodge_total": 0,
//     "speed_total": 10,
//     "understand_total": 0
//   }, {
//     "_id": "mem-bbbb",
//     "hp_total": 333,
//     "outerAttack_total": 21,
//     "innerAttack_total": 10,
//     "outerDefense_total": 5,
//     "innerDefense_total": 3,
//     "crit_total": 0,
//     "dodge_total": 0,
//     "speed_total": 98,
//     "understand_total": 0
//   }],
//   "arrMemberInfoB": [{
//     "_id": "mem-saklsandsladl",
//     "hp_total": 100,
//     "outerAttack_total": 20,
//     "innerAttack_total": 10,
//     "outerDefense_total": 300,
//     "innerDefense_total": 3,
//     "crit_total": 0,
//     "dodge_total": 0,
//     "speed_total": 55,
//     "understand_total": 0
//   }, {
//     "_id": "mem-sddsdsos",
//     "hp_total": 300,
//     "outerAttack_total": 35,
//     "innerAttack_total": 26,
//     "outerDefense_total": 6,
//     "innerDefense_total": 3,
//     "crit_total": 0,
//     "dodge_total": 0,
//     "speed_total": 47,
//     "understand_total": 0
//   }]
// }

//////////////////////////////////////////////////
// fetchBattleResult
// 获取战斗结果
// param 
// arrMemberInfoA: Array
// arrMemberInfoB: Array
// return
// arrListResult: Array      
//////////////////////////////////////////////////
// 云函数入口函数
exports.main = async (event, context) => {
  let result = true;
  const arrMemberInfoA = event.arrMemberInfoA !== undefined ? event.arrMemberInfoA : [];
  const arrMemberInfoB = event.arrMemberInfoB !== undefined ? event.arrMemberInfoB : [];

  const {bWin, arrListResult} = funBattle(arrMemberInfoA, arrMemberInfoB);

  return {
    result,
    bWin,
    arrListResult,
  }
}