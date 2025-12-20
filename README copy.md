# Mars3D 三维地图展示 Demo

一个基于 Mars3D 的三维地图展示 demo 项目，使用 Vue3 + TypeScript + Vite 构建，提供了丰富的地图交互功能和数据可视化能力。

## 技术栈

| 技术/依赖 | 版本 | 用途 |
|---------|------|------|
| Vue | ^3.5.22 | 前端框架 |
| TypeScript | ^5.9.3 | 类型系统 |
| Vite | ^7.1.11 | 构建工具 |
| Vue Router | ^4.6.3 | 路由管理 |
| Pinia | ^3.0.4 | 状态管理 |
| Mars3D | ~3.10.0 | 三维地图核心库 |
| Mars3D-Cesium | ~1.135.0 | 底层三维引擎 |
| Mars3D-TDT | ~3.10.0 | 天地图扩展 |
| Mars3D-ECharts | ~3.10.0 | ECharts 可视化扩展 |
| Mars3D-Heatmap | ~3.10.0 | 热力图扩展 |
| Mars3D-MapV | ~3.10.0 | MapV 可视化扩展 |
| Mars3D-Space | ~3.10.0 | 太空扩展 |
| Turf.js | ^7.2.0 | 地理空间分析库 |
| Axios | ^1.10.0 | HTTP 客户端 |

## 项目结构

```
├── public/
│   ├── config/
│   │   └── mapConfig.json         # 地图配置文件
│   ├── glb/
│   │   ├── car.glb               # 车辆模型
│   │   └── drone.glb             # 无人机模型
├── src/
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   ├── components/
│   │   └── mars3dMap/            # Mars3D 地图组件
│   │       ├── index.vue         # 地图主组件
│   │       └── ts/
│   │           ├── setPoint.ts   # 点位设置工具
│   │           ├── setCover.ts   # 覆盖物设置工具
│   │           ├── move.ts       # 移动控制工具
│   │           ├── playback.ts   # 回放控制工具
│   │           └── utils.ts      # 地图工具函数
│   ├── views/
│   │   ├── map/
│   │   │   ├── index.vue         # 地图主页面
│   │   │   └── mapControls.vue   # 地图控制组件
│   │   └── AboutPage.vue         # 关于页面
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── stores/
│   │   └── modules/
│   │       └── mapStore.ts       # 地图状态管理
│   ├── assets/
│   │   ├── css/                  # 样式文件
│   │   └── img/                  # 图片资源
│   └── utils/
│       └── getDefaultContextMenu.ts  # 右键菜单配置
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 功能特点

### 地图基础功能
- 支持多源底图切换（天地图、高德、百度、腾讯等）
- 二三维地图无缝切换 （支持拖拽过程中的随时二三维地图视角切换）
- 地形显示与分析
- 地图控件（缩放、指南针、距离测量、坐标显示等）
- 自定义右键菜单

### 数据可视化
- 点标记（支持: 图片点位、自定义div点位、3D模型点位等）
- 无人机模型+飞行轨迹展示
- 轨迹回放 （模拟无人机飞行的历史数据）
- 打击圈、预警圈、探测圈的显示+隐藏控制

### 交互功能
- 通过自定义按钮实现：上诉3种点位的移动
- 通过自定义按钮实现：无人机实时位置+航迹展示（通过按钮触发，后期接上websocket）
- 左下角在系统按钮的基础上增加自定义按钮实现：
  - 切换2D/3D地图视角
- 自定义工具栏：实现二三维地图的切换
- 地图状态管理：地图加载中、已加载的状态提示
- 多地图实例支持：可对高德、谷歌、天地图等不同底图进行切换

## 快速开始

### 环境要求
- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 安装依赖

```bash
npm install
```

### 开发服务器

启动本地开发服务器：

```bash
npm run dev
```

默认会在 http://localhost:5173 启动开发服务器。

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

## 开发说明

### 地图配置

地图的主要配置在 `public/config/mapConfig.json` 文件中，包括：
- 地图中心点和初始视角
- 底图和图层配置
- 控件设置
- 地形配置

### 地图组件使用

在页面中引入地图组件：

```vue
<template>
  <mars3d-map 
    :url="configUrl" 
    :options="options" 
    @onload="mapOnLoad"/>
</template>

<script setup lang="ts">
import Mars3dMap from '@/components/mars3dMap/index.vue'

const configUrl = `${process.env.BASE_URL}/config/mapConfig.json`

const options = {
  scene: {
    center: {
      lat: 31.686288,
      lng: 114.5704352,
      alt: 3000
    }
  }
}

const mapOnLoad = (map: any) => {
  // 地图加载完成后的回调
}
</script>
```

### 点位和覆盖物

使用工具函数添加点位和覆盖物：

```typescript
import { setPoint } from '@/components/mars3dMap/ts/setPoint'
import { setCover } from '@/components/mars3dMap/ts/setCover'

// 添加图片点位
const { setPointByImg } = setPoint()
setPointByImg({id: '1', lng: 117.229619, lat: 31.716288})

// 添加3D模型点位
setPointByGlb({id: '3', url: `${process.env.BASE_URL}/glb/car.glb`, lng: 117.228433, lat: 31.723159, height: 0, heading: 90})

// 添加圆形覆盖区域
const { setThreeCircles } = setCover()
setThreeCircles({position: [117.228433, 31.723159, 0], radius: [300, 600, 800], text: ['打击圈', '预警圈', '探测圈']})
```

## 注意事项

1. 项目使用了 Mars3D 相关库，需要确保网络连接正常以加载地图资源
2. 地图配置文件较大，建议在生产环境中进行压缩
3. 3D 模型文件位于 `public/glb/` 目录下，可以根据需要替换
4. 地图中心点和初始视角可以在 `src/views/map/index.vue` 中修改


