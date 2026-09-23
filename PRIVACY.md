# 隐私说明 · Privacy Notice

## 简体中文

暮光起始页是一款本地优先的 Chrome 新标签页扩展。

### 保存的数据

以下数据保存在 Chrome 扩展存储中：

- 用户创建或导入的书签与分组；
- 当前背景、最近使用的 10 张自定义壁纸与壁纸收藏；
- 用户上传的书签图标；
- 从网站获取的网站图标缓存；
- 是否显示“最近打开”等界面设置与数据迁移版本。

### 最近打开

“最近打开”默认开启，可在编辑面板中关闭。开启时，扩展使用 Chrome 的历史记录接口在本机读取最近访问的网页，经网址去重后仅显示最近 8 项。读取结果仅用于当前起始页展示，不会写入扩展存储，也不会上传或共享。

### 网络访问

扩展访问书签或“最近打开”所列网站，只用于读取页面声明的 Touch Icon、Web App Manifest 和 favicon。用户主动选择 **Google 获取** 时，扩展会访问 Google 官方 favicon 服务。只有用户打开对应壁纸分类时，扩展才会访问 Microsoft Bing 或 Wallhaven 的公开接口获取壁纸列表；用户选用联网壁纸时，图片会下载、压缩并保存在本机扩展存储中。

### 不会进行的操作

- 不读取或修改 Chrome 自带书签；
- 不收集分析数据或遥测信息；
- 不上传书签、背景或用户自定义图标；
- 不包含远程执行脚本；
- 不出售或共享用户数据。

删除扩展会由 Chrome 一并删除扩展的本地存储。用户也可以在编辑面板中导出书签 HTML，或使用 **恢复初始内容** 清空扩展数据。

---

## English

Twilight Start Page is a local-first Chrome new tab extension.

### Data stored

The following data is kept in Chrome extension storage:

- bookmarks and groups created or imported by the user;
- the current background, the ten most recently used custom wallpapers, and wallpaper favorites;
- bookmark icons uploaded by the user;
- website icon cache;
- interface settings, including whether **Recently Opened** is shown, and data migration versions.

### Recently Opened

**Recently Opened** is enabled by default and can be disabled in the edit panel. When enabled, the extension uses Chrome's history API locally, removes duplicate URLs, and displays only the eight most recently visited pages. These results are used only for the current start page and are neither saved to extension storage nor uploaded or shared.

### Network access

The extension accesses bookmarked or recently opened websites only to discover declared Touch Icons, Web App Manifest icons, and favicons. When the user explicitly selects **Google Fetch**, the extension contacts Google's official favicon service. Microsoft Bing or Wallhaven public endpoints are contacted only after the user opens the corresponding wallpaper category. When an online wallpaper is selected, it is downloaded, compressed, and saved in local extension storage.

### What the extension does not do

- It does not read or modify Chrome's built-in bookmarks.
- It does not collect analytics or telemetry.
- It does not upload bookmarks, backgrounds, or custom icons.
- It does not include remotely executed scripts.
- It does not sell or share user data.

Removing the extension also removes its local extension storage through Chrome. Users can export bookmark HTML from the edit panel or clear extension data with **Restore initial content**.
