# 《醉梦坛说》微信小游戏配套云函数

## 接口
### queryGameDetail
查询游戏的全局信息

### queryMemberInfo
查询成员信息

### updateMemeberInfo
更新/创建的角色信息

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