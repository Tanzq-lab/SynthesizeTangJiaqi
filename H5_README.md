# POLO小球 H5 运行说明

## 本版内容

这个 ZIP 是完整 H5 可运行版，保留原项目结构：

- `index.html`：H5 浏览器入口；
- `game.js`：核心 Canvas 游戏逻辑；
- `minigame/assets/`：图片和音频资源；
- `game.json`、`project.config.json`：保留原抖音小游戏配置，方便后续双端维护。

## 本地运行

不要直接双击 `index.html` 用 `file://` 运行，部分浏览器会限制音频、资源或缓存行为。建议在项目根目录启动本地服务器：

```bash
python -m http.server 5173
```

然后打开：

```text
http://127.0.0.1:5173/
```

也可以使用 VSCode Live Server、Nginx、Caddy、宝塔静态站点等方式部署。

## H5 适配说明

- 浏览器环境自动使用 `document.createElement("canvas")` 创建画布；
- 图片资源走 `minigame/assets/...` 相对路径；
- 音频在首次点击后解锁播放，符合移动浏览器策略；
- 最高分使用 `localStorage` 保存；
- Canvas 已设置为全屏固定定位，禁用页面滚动、缩放、长按菜单和点击高亮；
- 抖音小游戏环境下仍优先使用 `tt.createCanvas`、`tt.createImage`、`tt.createInnerAudioContext`、`tt.getStorageSync` 等平台能力。

## 验证清单

1. 打开页面后能看到首页；
2. 点击“开始整活”进入游戏；
3. 横向移动指针、点击掉落角色正常；
4. 合成、得分、危险线、结算、续命卡牌正常；
5. 首次点击后音效可以播放；
6. 刷新页面后最高分仍保留；
7. 手机浏览器中页面不滚动、不误缩放。
