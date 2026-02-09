# mars3d-map

## 项目介绍

一个基于 Mars3D 的三维地图项目，使用现代化的前端技术栈，提供了强大的三维地图功能和深蓝色科技风的视觉效果。

## 技术栈

| 技术/依赖 | 版本 | 用途 |
|---------|------|------|
| Mars3D | 最新版 | 三维地图渲染引擎 |
| Vue | ^3.x | 前端框架 |
| TypeScript | ^5.x | 类型系统 |
| Vite | ^7.x | 构建工具 |
| Cesium | 最新版 | 底层地图引擎 |

## 项目结构

```
├── public/              # 公共资源
│   ├── config/          # 配置文件
│   │   └── mapConfig.json  # 地图配置文件
│   └── img/             # 图片资源
├── src/                 # 源代码
│   ├── assets/          # 静态资源
│   ├── components/      # 组件
│   ├── utils/           # 工具函数
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 环境要求

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- 现代浏览器：
  - Chrome 90+ 
  - Edge 90+ 
  - Firefox 88+ 
  - Safari 14+

## 快速开始

### 设置淘宝镜像

```bash
npm config set registry https://registry.npmmirror.com
```

### 安装依赖

```bash
npm install
```

### 开发服务器

启动本地开发服务器：

```bash
npm run dev
```

默认会在 http://localhost:3000 启动开发服务器。

### 构建生产版本

构建用于生产的应用：

```bash
npm run build
```

### 预览生产构建

预览生产构建结果：

```bash
npm run preview
```

## 主要功能

✅ Mars3D 三维地图加载与渲染
✅ 深蓝色科技风地图瓦片效果
✅ 多种底图切换功能
✅ 地形数据展示
✅ 丰富的图层管理
✅ 三维模型加载与展示
✅ 地图控件配置
✅ 交互式地图操作

## 开发说明

### 地图配置

地图的样式和功能配置主要在 `public/config/mapConfig.json` 文件中定义，包括：

- 底图设置（深蓝色科技风效果）
- 图层配置
- 地球基础颜色
- 控件配置
- 地形设置

### 深蓝色科技风配置

在 `mapConfig.json` 中，通过以下参数实现深蓝色科技风效果：

```json
{
  "invertColor": true, // 是否反转颜色
  "filterColor": "#4e70a6", // 滤镜颜色，设置为深蓝色
  "brightness": 0.6, // 亮度，0.6表示降低亮度
  "contrast": 1.8, // 对比度，1.8表示增加对比度
  "gamma": 0.3, // 伽马值，0.3表示降低伽马
  "hue": 1, // 色调，1表示完全改变色调
  "saturation": 0 // 饱和度，0表示完全去饱和
}
```

同时，地球基础颜色也设置为深蓝色：

```json
"globe": {
  "baseColor": "#0a1929" // 深蓝色科技风地球基础颜色
}
```

## 参考资源

**Mars3D 官方文档**：
- [Mars3D 官网](http://mars3d.cn/)
- [Mars3D API 文档](http://mars3d.cn/api/)

**Cesium 官方文档**：
- [Cesium 官网](https://cesium.com/)
- [Cesium API 文档](https://cesium.com/docs/)

## 致谢

感谢 Mars3D 团队提供的优秀三维地图开发框架，为项目的实现提供了强大的技术支持。