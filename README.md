# 《醉梦坛说》微信小游戏配套云函数

### queryGameDetail
查询游戏的全局信息

### queryMemberInfo
查询成员信息

### updateMemeberInfo
更新/创建的角色信息

### 脚本
#### 整理装备资料库 database_suit
``` sql  
// 整理装备资料库
db.collection('database_suit')
  .add({
    data: [{
      _id: 'apple-1',
      name: 'apple',
      category: 'fruit',
      price: 10,
    }, {
      _id: 'orange-1',
      name: 'orange',
      category: 'fruit',
      price: 15,
    }, {
      _id: 'watermelon-1',
      name: 'watermelon',
      category: 'fruit',
      price: 20,
    }, {
      _id: 'yaourt-1',
      name: 'yaourt',
      category: 'dairy',
      price: 8,
    }, {
      _id: 'milk-1',
      name: 'milk',
      category: 'dairy',
      price: 12,
    }, {
      _id: 'chocolate-1',
      name: 'Lindt chocolate',
      category: 'chocolate',
      price: 16,
    }]
  })

```