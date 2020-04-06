# 《醉梦坛说》微信小游戏配套云函数

## 接口

### createRewards
//////////////////////////////////////////////////
// createRewards
// 获取奖励
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: String         'box' - 装备抽奖  'roll' - 轮盘抽奖 '' - 功法抽奖
// count: Number        抽奖次数
// return
// result: Boolean      接口成功标识
// prize: Array         [{_id:'', id:'', total:5, time:0}] 物品UUID唯一标识 物品ID 物品数量 创建时间戳
//////////////////////////////////////////////////

### queryGameDetail
//////////////////////////////////////////////////
// queryGameDetail
// 查询游戏的全局信息
// param 
// return
// result: Boolean      接口成功标识
// game: Object         游戏信息对象
//////////////////////////////////////////////////

### queryMemberInfo
//////////////////////////////////////////////////
// queryMemberInfo
// 查询角色信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// return
// result: Boolean      接口成功标识
// member: Object       成员信息对象
//////////////////////////////////////////////////

### queryPartsInfo
//////////////////////////////////////////////////
// queryPartsInfo
// 查询角色的附属数据信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// type: String         'equipment' - 装备, 'magic' - 功法, 'medicine' - 丹药, 'other' - 其他
// return
// result: Boolean      接口成功标识
// prize: Array         [{_id:'', id:'', total:5, time:0}] 物品UUID唯一标识 物品ID 物品数量 创建时间戳
//////////////////////////////////////////////////

### updateMemeberInfo
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

### updatePartsInfo
//////////////////////////////////////////////////
// updatePartsInfo
// 更新/创建的配件信息
// param 
// openid: String       openid 如果传值则查询对应id的角色信息、如果不传值则查询自身的角色信息
// partsInfo: Array     物品信息
// partsType: String    配件列表名称
// return
// result: Boolean      接口成功标识
//////////////////////////////////////////////////

## 脚本
#### 装备资料库表 database_equipment

``` sql
// 清空装备资料库
db.collection('database_equipment')
.where({
  _id: _.exists(true)
})
.remove()
```