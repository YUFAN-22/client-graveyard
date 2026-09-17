# Client Graveyard · 甲方墓园

> **Bury the project. Keep the lesson.**  
> 一个用于项目复盘、情绪释放和记录合作教训的本地像素 Web App。

甲方墓园把一次次“难忘合作”变成可浏览的像素墓碑：记录甲方特质、合作事件和项目教训；想放下时可以上一炷香，想发泄时可以扔一个 💩。核心数据默认只保存在用户自己的浏览器里。

## 当前版本

**Arcade Pixel v1.1**

- 桌面端固定每行 4 块墓碑
- 手机端固定每行 2 块墓碑
- 墓碑按同一地面基线底部对齐
- 复古掌机 / 街机式像素 UI
- 中文信息使用高可读粗黑字体

## 项目截图



## 功能

- 🪦 像素墓园
- 📝 甲方档案：姓名/代号、特质、立碑日期、墓志铭、墓碑皮肤
- 📜 往事时间轴：支持无限添加、编辑、删除合作事件
- 🕯️ 上香：像素蜡烛、烟雾、随机复盘文案
- 💩 扔大便：抛物线命中、墓碑震动、随机吐槽文案
- 🌱 墓碑状态：随 💩 数量出现杂草、裂纹、乌鸦和“重点纪念”状态
- 🔎 搜索与特质筛选
- 📊 墓园管理局
- 🏆 成就系统与彩蛋
- 📅 今日祭扫
- 🌙 自动 / 手动昼夜切换
- 🌫️ 晴 / 雾 / 雨环境效果
- ♪ 本地生成环境音，不加载外部音频
- ▧ 生成 16:9 PNG 分享卡
- 💾 JSON 导入、导出、清空与旧版数据迁移
- 🔒 无账号、无服务器、无第三方统计



本项目是纯静态 HTML / CSS / JavaScript，不需要构建步骤，适合直接部署到 GitHub Pages。

在仓库中打开：

**Settings → Pages → Build and deployment → Deploy from a branch**

选择：

- Branch：`main`
- Folder：`/ (root)`

保存后等待 GitHub 生成公开地址。

## 本地使用

下载整个仓库后直接打开 `index.html` 即可。

开发时也可以启动静态服务器：

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 项目结构

```text
client-graveyard/
├─ index.html
├─ css/
│  ├─ style.css
│  ├─ pixel.css
│  ├─ responsive.css
│  └─ arcade-v11.css
├─ js/
│  ├─ storage.js
│  ├─ events.js
│  ├─ animations.js
│  ├─ achievements.js
│  ├─ graveyard.js
│  ├─ profile.js
│  └─ app.js
├─ demo-data.json
├─ .nojekyll
├─ LICENSE
└─ README.md
```

## 数据与隐私

- 数据默认使用浏览器 `localStorage` 保存。
- 项目不会主动把用户输入上传到服务器。
- 不需要注册或登录。
- 建议用昵称、代号或项目代称，不要记录手机号、住址、证件号码、银行账号、公司机密等敏感信息。
- 公开截图、分享卡或备份文件前，请自行检查是否包含可识别个人的信息。
- 清除浏览器网站数据会删除本地墓园，请定期导出 JSON 备份。

## 安全与使用边界

这是一个用于私人项目复盘、情绪表达和自嘲的工具，不提供公开真人数据库、公开排行榜或云端甲方信息共享功能。建议保持“记录经历，而不是围攻个人”的使用方式。

## License

MIT License。详见 [LICENSE](LICENSE)。
