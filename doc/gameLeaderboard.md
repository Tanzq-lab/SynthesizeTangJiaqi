# CloudBase 通用排行榜后端说明

## 1. 后端定位

这是一个给多个 H5 / 小游戏复用的轻量级排行榜后端。

当前游戏正式配置：

```txt
BaseUrl：
https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com

排行榜接口：
https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com/game/leaderboard

当前游戏 channel：
SynthesizeTangJiaqi
```

不同游戏通过 `channel` 区分。
一个 `channel` 就代表一个游戏。

---

# 2. 后端组成

```txt
CloudBase 云函数：
gameLeaderboard

数据库集合：
gameLeaderboard_scores

HTTP 路由：
/game/leaderboard
```

正式接口统一走：

```txt
https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com/game/leaderboard
```

旧接口 `/leaderboard` 不属于这套新通用排行榜，不要混用。

---

# 3. 排行榜规则

当前排行榜规则：

```txt
1. 只做总榜
2. 只记录历史最高分
3. 每个玩家每个游戏只保留一条记录
4. 高分会更新原记录
5. 低分或相同分不会覆盖原高分
6. 通过 channel 区分不同游戏
7. 通过 playerId 区分玩家
8. 只存昵称，不存头像
```

唯一玩家记录规则：

```txt
channel + playerId = 唯一排行榜记录
```

例如：

```txt
channel = SynthesizeTangJiaqi
playerId = guest_abc123

这两个字段共同确定一个玩家在当前游戏里的排行榜记录。
```

---

# 4. 数据库存储字段

集合名：

```txt
gameLeaderboard_scores
```

单条记录结构：

```js
{
  _id: "数据库自动生成",

  channel: "SynthesizeTangJiaqi",
  playerId: "guest_xxxxx",
  nickname: "玩家1234",

  score: 12345,

  createdAt: Date,
  updatedAt: Date
}
```

字段说明：

| 字段          | 说明            |
| ----------- | ------------- |
| `_id`       | 数据库自动生成的文档 ID |
| `channel`   | 游戏标识          |
| `playerId`  | 玩家游客 ID       |
| `nickname`  | 玩家昵称          |
| `score`     | 历史最高分         |
| `createdAt` | 首次上榜时间        |
| `updatedAt` | 最近刷新最高分时间     |

不存这些数据：

```txt
头像
设备信息
IP
平台信息
每局战绩
广告数据
埋点数据
游戏标题
无关用户资料
```

---

# 5. 数据库索引

## 索引 1：排行榜排序索引

```txt
索引名称：
idx_channel_score_updatedAt

索引属性：
非唯一

字段：
channel     升序
score       降序
updatedAt   升序
```

用途：

```txt
查询某个游戏的排行榜。
分数越高排名越靠前。
分数相同，越早达到该分数的人排名越靠前。
```

---

## 索引 2：玩家唯一索引

```txt
索引名称：
idx_channel_playerId

索引属性：
唯一

字段：
channel     升序
playerId    升序
```

用途：

```txt
保证同一个游戏下，同一个 playerId 只能有一条排行榜记录。
```

---

# 6. 云函数环境变量

云函数 `gameLeaderboard` 需要配置：

```txt
LEADERBOARD_CHANNELS=SynthesizeTangJiaqi
LEADERBOARD_MAX_SCORE=999999999
```

如果后续多个游戏共用这套后端，例如再加一个 `polo_ball`，就改成：

```txt
LEADERBOARD_CHANNELS=SynthesizeTangJiaqi,polo_ball
```

注意：

```txt
channel 是大小写敏感的。
前端传 SynthesizeTangJiaqi，环境变量里也必须是 SynthesizeTangJiaqi。
```

---

# 7. 正式接口列表

当前正式接口只有 3 个：

```txt
submitScore  提交最高分
getTop       获取排行榜
getMyRank    获取自己排名
```

没有 debug 接口。
没有 ping 接口。

---

# 8. 接口一：提交最高分 submitScore

## 用途

玩家刷新本地历史最高分时调用。

前端不需要每局都提交。
只在本局分数超过本地最高分时提交。

---

## 请求方式

```txt
POST /game/leaderboard
```

完整地址：

```txt
https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com/game/leaderboard
```

---

## 请求 Body

```json
{
  "action": "submitScore",
  "channel": "SynthesizeTangJiaqi",
  "playerId": "guest_xxxxx",
  "nickname": "玩家1234",
  "score": 12345
}
```

字段说明：

| 字段         | 必填 | 说明                               |
| ---------- | -: | -------------------------------- |
| `action`   |  是 | 固定传 `submitScore`                |
| `channel`  |  是 | 当前游戏标识，这里是 `SynthesizeTangJiaqi` |
| `playerId` |  是 | 前端本地生成的游客 ID                     |
| `nickname` |  是 | 玩家昵称                             |
| `score`    |  是 | 玩家当前历史最高分                        |

---

## 返回示例：高分更新成功

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "channel": "SynthesizeTangJiaqi",
    "playerId": "guest_xxxxx",
    "nickname": "玩家1234",
    "score": 12345,
    "highScore": 12345,
    "updated": true,
    "rank": 1
  }
}
```

---

## 返回示例：低分没有覆盖

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "channel": "SynthesizeTangJiaqi",
    "playerId": "guest_xxxxx",
    "nickname": "玩家1234",
    "score": 12345,
    "highScore": 12345,
    "updated": false,
    "rank": 1
  }
}
```

`updated` 含义：

```txt
true   本次提交刷新了云端最高分
false  本次提交没有超过云端最高分
```

---

# 9. 接口二：获取排行榜 getTop

## 用途

获取当前游戏排行榜前 N 名。

---

## 请求方式

```txt
GET /game/leaderboard?action=getTop&channel=SynthesizeTangJiaqi&limit=50
```

完整地址：

```txt
https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com/game/leaderboard?action=getTop&channel=SynthesizeTangJiaqi&limit=50
```

---

## 参数说明

| 参数        | 必填 | 说明                |
| --------- | -: | ----------------- |
| `action`  |  是 | 固定传 `getTop`      |
| `channel` |  是 | 当前游戏标识            |
| `limit`   |  否 | 返回数量，默认 50，最大 100 |

---

## 返回示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "channel": "SynthesizeTangJiaqi",
    "limit": 50,
    "list": [
      {
        "rank": 1,
        "nickname": "玩家A",
        "score": 99999
      },
      {
        "rank": 2,
        "nickname": "玩家B",
        "score": 88888
      }
    ]
  }
}
```

注意：

```txt
getTop 不返回 playerId。
排行榜展示不需要暴露玩家身份标识。
```

---

# 10. 接口三：获取自己排名 getMyRank

## 用途

获取当前玩家自己的排名和最高分。

---

## 请求方式

```txt
GET /game/leaderboard?action=getMyRank&channel=SynthesizeTangJiaqi&playerId=guest_xxxxx
```

完整地址：

```txt
https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com/game/leaderboard?action=getMyRank&channel=SynthesizeTangJiaqi&playerId=guest_xxxxx
```

---

## 参数说明

| 参数         | 必填 | 说明              |
| ---------- | -: | --------------- |
| `action`   |  是 | 固定传 `getMyRank` |
| `channel`  |  是 | 当前游戏标识          |
| `playerId` |  是 | 玩家游客 ID         |

---

## 返回示例：玩家已上榜

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "channel": "SynthesizeTangJiaqi",
    "playerId": "guest_xxxxx",
    "exists": true,
    "rank": 5,
    "score": 12345,
    "nickname": "玩家1234"
  }
}
```

---

## 返回示例：玩家未上榜

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "channel": "SynthesizeTangJiaqi",
    "playerId": "guest_xxxxx",
    "exists": false,
    "rank": null,
    "score": 0,
    "nickname": ""
  }
}
```

---

# 11. 前端接入建议

## 前端常量

```js
const LEADERBOARD_URL =
  "https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com/game/leaderboard";

const LEADERBOARD_CHANNEL = "SynthesizeTangJiaqi";
```

---

## 生成游客 ID

玩家不用登录，所以前端需要本地生成游客 ID。

```js
function getOrCreateLeaderboardPlayerId() {
  const key = "game_leaderboard_player_id";
  let playerId = localStorage.getItem(key);

  if (!playerId) {
    playerId =
      "guest_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 10);

    localStorage.setItem(key, playerId);
  }

  return playerId;
}
```

如果是抖音小游戏环境，可以换成 `tt.getStorageSync` / `tt.setStorageSync`。

---

## 提交最高分

```js
async function submitLeaderboardScore(highScore, nickname) {
  const payload = {
    action: "submitScore",
    channel: LEADERBOARD_CHANNEL,
    playerId: getOrCreateLeaderboardPlayerId(),
    nickname: nickname || "匿名玩家",
    score: highScore
  };

  const res = await fetch(LEADERBOARD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  return await res.json();
}
```

调用时机：

```js
if (score > highScore) {
  highScore = score;
  saveHighScore(highScore);

  submitLeaderboardScore(highScore, nickname).catch(function (err) {
    console.warn("排行榜提交失败", err);
  });
}
```

---

## 获取排行榜

```js
async function getLeaderboardTop(limit) {
  const url =
    LEADERBOARD_URL +
    "?action=getTop" +
    "&channel=" +
    encodeURIComponent(LEADERBOARD_CHANNEL) +
    "&limit=" +
    encodeURIComponent(limit || 50);

  const res = await fetch(url);
  return await res.json();
}
```

---

## 获取自己排名

```js
async function getMyLeaderboardRank() {
  const playerId = getOrCreateLeaderboardPlayerId();

  const url =
    LEADERBOARD_URL +
    "?action=getMyRank" +
    "&channel=" +
    encodeURIComponent(LEADERBOARD_CHANNEL) +
    "&playerId=" +
    encodeURIComponent(playerId);

  const res = await fetch(url);
  return await res.json();
}
```

---

# 12. PowerShell 测试命令

先设置 BaseUrl：

```powershell
$BaseUrl = "https://poloball-analytics-d1cgr97b043f9-1431279216.ap-shanghai.app.tcloudbase.com"
$LeaderboardUrl = "$BaseUrl/game/leaderboard"
$Channel = "SynthesizeTangJiaqi"
```

---

## 提交分数

```powershell
$Body = @{
  action   = "submitScore"
  channel  = $Channel
  playerId = "guest_test_http_000001"
  nickname = "HTTP测试玩家"
  score    = 3000
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
  -Uri $LeaderboardUrl `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $Body

$result | ConvertTo-Json -Depth 10
```

---

## 获取排行榜

```powershell
$result = Invoke-RestMethod `
  -Uri "$LeaderboardUrl?action=getTop&channel=$Channel&limit=50" `
  -Method GET

$result | ConvertTo-Json -Depth 10
```

---

## 获取自己排名

```powershell
$result = Invoke-RestMethod `
  -Uri "$LeaderboardUrl?action=getMyRank&channel=$Channel&playerId=guest_test_http_000001" `
  -Method GET

$result | ConvertTo-Json -Depth 10
```

---

## 测试低分不会覆盖

```powershell
$Body = @{
  action   = "submitScore"
  channel  = $Channel
  playerId = "guest_test_http_000001"
  nickname = "HTTP测试玩家"
  score    = 1000
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
  -Uri $LeaderboardUrl `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $Body

$result | ConvertTo-Json -Depth 10
```

预期：

```txt
updated = false
score = 3000
highScore = 3000
```

---

## 测试高分会更新

```powershell
$Body = @{
  action   = "submitScore"
  channel  = $Channel
  playerId = "guest_test_http_000001"
  nickname = "HTTP测试玩家"
  score    = 5000
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
  -Uri $LeaderboardUrl `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $Body

$result | ConvertTo-Json -Depth 10
```

预期：

```txt
updated = true
score = 5000
highScore = 5000
```

---

# 13. 常见错误码

## UNKNOWN_ACTION

原因：

```txt
action 参数不存在，或者传了后端不支持的 action。
```

只支持：

```txt
submitScore
getTop
getMyRank
```

已经没有：

```txt
ping
debug
```

---

## CHANNEL_NOT_ALLOWED

原因：

```txt
channel 不在云函数环境变量 LEADERBOARD_CHANNELS 里。
```

解决：

```txt
把 SynthesizeTangJiaqi 加到 LEADERBOARD_CHANNELS。
```

正确配置：

```txt
LEADERBOARD_CHANNELS=SynthesizeTangJiaqi
```

---

## INVALID_CHANNEL

原因：

```txt
channel 格式不合法。
```

当前允许：

```txt
英文
数字
下划线
长度 2 到 32
```

`SynthesizeTangJiaqi` 是合法的。

---

## INVALID_PLAYER_ID

原因：

```txt
playerId 格式不合法。
```

当前允许：

```txt
英文
数字
下划线
中横线
长度 8 到 80
```

推荐格式：

```txt
guest_时间戳_随机字符
```

---

## INVALID_SCORE

原因：

```txt
score 不是有效数字。
```

---

## INVALID_SCORE_RANGE

原因：

```txt
score 小于 0，或者超过 LEADERBOARD_MAX_SCORE。
```

---

# 14. 上线前检查清单

上线前确认这些：

```txt
1. 云函数 gameLeaderboard 已部署
2. HTTP 路由 /game/leaderboard 已启用
3. 集合 gameLeaderboard_scores 存在
4. 集合权限禁止客户端直接读写
5. 索引 idx_channel_score_updatedAt 已创建
6. 索引 idx_channel_playerId 已创建，并且是唯一索引
7. LEADERBOARD_CHANNELS 包含 SynthesizeTangJiaqi
8. LEADERBOARD_MAX_SCORE 已配置
9. 测试数据已清理
10. 前端 channel 使用 SynthesizeTangJiaqi
```

---

# 15. 后续新增游戏怎么接入

假设以后新增一个游戏：

```txt
polo_ball
```

不需要新建数据库。
不需要新建云函数。
不需要新建 HTTP 路由。

只需要：

## 第一步：更新环境变量

```txt
LEADERBOARD_CHANNELS=SynthesizeTangJiaqi,polo_ball
```

## 第二步：新游戏前端传新 channel

```js
const LEADERBOARD_CHANNEL = "polo_ball";
```

这样 `polo_ball` 会使用同一个后端，但排行榜数据和 `SynthesizeTangJiaqi` 完全隔离。

---