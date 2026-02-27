<template>
  <div :id="withKeyId" class="mars3d-container"></div>
</template>

<script setup lang="ts">
import * as mars3d from "mars3d"
import { computed, onUnmounted, onMounted, toRaw } from "vue"

const props = withDefaults(
  defineProps<{
    mapKey?: string // 多个地图时,可传入key区分地图
    url?: string // 传入的地图构造参数url，可为空，只传options
    options?: any // 传入的地图构造参数options，可覆盖url内的参数
  }>(),
  {
    mapKey: "default",
    url: undefined,
    options: undefined
  }
)

// 用于存放地球组件实例
let map: mars3d.Map // 地图对象

// 使用用户传入的 mapKey 拼接生成 withKeyId 作为当前显示容器的id
const withKeyId = computed(() => `mars3d-container-${props.mapKey}`)

// onload事件将在地图渲染后触发
const emit = defineEmits(["onload"])

const initMars3d = async () => {
  // 获取配置
  let mapOptions
  if (props.url) {
    // 存在url时才读取
    const response = await fetch(props.url)
    const jsonStr = await response.text()
    const cleanStr = jsonStr.replace(/^\uFEFF/, '') // 移除 BOM 头
    mapOptions = JSON.parse(cleanStr)
  }

  if (props.options) {
    // 存在叠加的属性时
    let exOptions
    if (props.options.then) {
      exOptions = toRaw(await props.options)
    } else {
      exOptions = toRaw(props.options)
    }

    if (mapOptions) {
      mapOptions = mars3d.Util.merge(mapOptions, exOptions) // 合并配置
    } else {
      mapOptions = exOptions
    }
  }

  map = new mars3d.Map(withKeyId.value, mapOptions)

  // 针对不同终端的优化配置
  if (mars3d.Util.isPCBroswer()) {
    map.zoomFactor = 2.0 // 鼠标滚轮放大的步长参数

    // IE浏览器优化
    if (window.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
      map.viewer.targetFrameRate = 20 // 限制帧率
      map.scene.requestRenderMode = false // 取消实时渲染
    }
  } else {
    map.zoomFactor = 5.0 // 鼠标滚轮放大的步长参数

    // 移动设备上禁掉以下几个选项，可以相对更加流畅
    map.scene.requestRenderMode = false // 取消实时渲染
    map.scene.fog.enabled = false
    map.scene.skyAtmosphere.show = false
    map.scene.globe.showGroundAtmosphere = false
  }

  // 监听相机移动事件，手动限制俯仰角
  map.viewer.camera.changed.addEventListener(() => {
    const pitch = map.viewer.camera.pitch
    const minPitch = -Math.PI / 2 // -90度
    const maxPitch = -Math.PI / 9 // -20度
    
    if (pitch < minPitch) {
      map.viewer.camera.setView({
        destination: map.viewer.camera.position,
        orientation: {
          heading: map.viewer.camera.heading,
          pitch: minPitch,
          roll: map.viewer.camera.roll
        }
      })
    } else if (pitch > maxPitch) {
      map.viewer.camera.setView({
        destination: map.viewer.camera.position,
        orientation: {
          heading: map.viewer.camera.heading,
          pitch: maxPitch,
          roll: map.viewer.camera.roll
        }
      })
    }
  })

  // 二三维切换不用动画
  if (map.viewer.sceneModePicker) {
    map.viewer.sceneModePicker.viewModel.duration = 0.0
  }

  // webgl渲染失败后，刷新页面
  map.on(mars3d.EventType.renderError, async () => {
    // await $alert("程序内存消耗过大，请重启浏览器")
    window.location.reload()
  })

  emit("onload", map)
}

onMounted(() => {
  initMars3d()
})

onUnmounted(() => {
  if (map) {
    map.destroy()
    map = null
  }
})
</script>

<style lang="less">
/**给控件工具按钮栏加边框样式*/
.cesium-button,
.cesium-geocoder-searchButton,
.cesium-viewer-geocoderContainer form .cesium-geocoder-input,
.mars3d-contextmenu-ul,
.mars3d-contextmenu-line {
  /* 移除有问题的外部图像资源，使用CSS边框替代 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* 自定义Popup样式*/
.mars3d-popup-btn-custom {
  padding: 3px 10px;
  border: 1px solid #209ffd;
  background: #209ffd1c;
  color: #ffffff;
}

/* 自定义Popup样式*/
.mars3d-popup-btn-custom {
  padding: 3px 10px;
  border: 1px solid #209ffd;
  background: #209ffd1c;
  color: var(--mars-text-color, #ffffff);
}
</style>