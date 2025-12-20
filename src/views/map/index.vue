<template>
  <div class="home-container">
    <!-- 引入地图控制组件 -->
    <MapControls />
    
    <!-- mars3D 地图 -->
    <mars3d-map 
      :url="configUrl" 
      :options="options" 
      @onload="mapOnLoad"/>
  </div>
</template>

<script setup lang="ts">
import * as mars3d from 'mars3d'

import Mars3dMap from '@/components/mars3dMap/index.vue'
import { setPoint } from '@/components/mars3dMap/ts/setPoint'
import { setCover } from '@/components/mars3dMap/ts/setCover'
import { useMapStore, MapLoadStatus } from '@/stores/modules/mapStore'
import { mapUtils } from '@/components/mars3dMap/ts/utils'
import MapControls from '@/views/map/mapControls.vue'
import meBtn from '@/assets/img/meBtn.svg'
import mapBtnTo2D from '@/assets/img/2D.svg'
import mapBtnTo3D from '@/assets/img/3D.svg'

// 获取store实例，保持响应性
const mapStore = useMapStore()

// 组件初始化时设置为加载中
mapStore.setMapLoadSta(MapLoadStatus.LOADING)

// 如果未来需要动态更改地图配置，可以使用ref使其成为响应式
// 目前由于configUrl只在组件初始化时计算一次，不需要响应式
const configUrl = `${process.env.BASE_URL}/config/mapConfig.json?time=${new Date().getTime()}`

// 设置地图属性： 中心点
const options = {
  "scene": {
    // 设置地图中心点
    "center": {
      "lat": 31.686288,
      "lng": 114.5704352,
      "alt": 3000
    }
  },
  "control": {
    "toolbar": {
      "position": "left-bottom", // 工具栏位置 "right-top"	右上角;"right-bottom"	右下角;"left-top"	左上角;"left-bottom"	左下角;"top-center"	顶部居中;"bottom-center"	底部居中
    },
    "baseLayerPicker": true,// 地图地图+地形切换功能
    "timeline": true, // 时间回放 时间轴
    "clockAnimate": true, // 时间回放 时间轴左边的时间显示
    "fullscreenButton": true, // 右下角全屏按钮
  }
}

// 地图加载完成后触发
const mapOnLoad = (map: any) => {
  mapStore.setMapLoadSta(MapLoadStatus.LOADED) // 地图加载完成，设置状态为已加载
  mapStore.setMap(map); // 地图加载完成, 全局设置地图对象到store中
  
  // 假设这里RTK给了新的地图中心点经纬度，更新地图中心点
  setMapCenterCameraView([117.229619, 31.726288, 0], 5000) // 设置地图中心相机视图
  // 地图左下角初始化系列自定义按钮 示意
  customButtonInit(map); 

  // 开始初始系列点位加载
  // 设置点位 （通过提供的图片设置点位）
  setPointByImg({id: '1', lng: 117.229619, lat: 31.716288});
  
  // 设置点位 （通过提供的div模型设置点位）
  setPointByDiv({id: '2', lng: 117.236334, lat: 31.715287});
  
  // 设置点位 + 高度 + 方向 （通过提供的glb模型设置点位，水平方位向角度）
  setPointByGlb({id: '3', url: `${process.env.BASE_URL}/glb/car.glb`, lng: 117.228433, lat: 31.723159, height: 0, heading: 90});

  // 设置3个圆覆盖区域
  setThreeCircles({position: [117.228433, 31.723159, 0], radius: [300, 600, 800], text: ['打击圈', '预警圈', '探测圈']});
}

/**
 * 初始化自定义按钮
 */
const customButtonInit = (map) => {

  // 示意： 自定义按钮 点击事件
  let hasSelected = false
  const toolButton = new mars3d.control.ToolButton({
    title: "示例按钮bookmark",
    icon: meBtn,
    className: "tool_bookmark_btn",
    insertIndex: 1, // 插入的位置顺序, 1是home按钮后面
    click: () => {
      hasSelected = !hasSelected
      if (hasSelected) {
        mars3d.DomUtil.addClass(toolButton.container, "toolButton-selected")
        alert("选中了 示例按钮bookmark，回调中想干啥就干啥~")
      } else {
        mars3d.DomUtil.removeClass(toolButton.container, "toolButton-selected")
        alert("取消选中了 示例按钮bookmark，回调中想干啥就干啥~")
      }
    }
  })
  map.addControl(toolButton)

  // 2、3维地图切换
  let hasSelected_23D = false
  const toolButton_2D3D = new mars3d.control.ToolButton({
    title: "2维、3维切换",
    icon: mapBtnTo2D,
    className: "custom-btn-2D3D",
    insertIndex: 4, // 插入的位置顺序
    click: () => {
      hasSelected_23D = !hasSelected_23D
      if(hasSelected_23D){
        (toolButton_2D3D as any).setIcon(mapBtnTo3D);
        switchTo2D3D()
      }else{
        (toolButton_2D3D as any).setIcon(mapBtnTo2D);
        switchTo2D3D()
      }
    }
  })
  map.addControl(toolButton_2D3D)
}

const {
  setPointByImg,
  setPointByDiv,
  setPointByGlb,
} = setPoint();

const {
  setThreeCircles
} = setCover();

const {
  switchTo2D3D,
  setMapCenterCameraView
} = mapUtils();
</script>

<style scoped>
.home-container {
  position: relative;
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>