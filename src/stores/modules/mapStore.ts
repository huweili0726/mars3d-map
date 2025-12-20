import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import * as mars3d from 'mars3d'

// 1. 定义地图加载状态的枚举，语义化状态值，避免魔法值
export enum MapLoadStatus {
  UNLOADED = 0,
  LOADING = 1,
  LOADED = 2,
  FAILED = 3 
}

// 2. 抽离状态与描述的映射常量，统一维护文案和状态码
const MAP_STATUS_MAP = {
  [MapLoadStatus.UNLOADED]: { info: '未加载', status: MapLoadStatus.UNLOADED },
  [MapLoadStatus.LOADING]: { info: '加载中', status: MapLoadStatus.LOADING },
  [MapLoadStatus.LOADED]: { info: '已加载', status: MapLoadStatus.LOADED },
  [MapLoadStatus.FAILED]: { info: '加载失败', status: MapLoadStatus.FAILED }, 
  default: { info: '未知状态', status: -1 }
}

export const useMapStore = defineStore('map', () => {
  // 地图对象引用
  const map = shallowRef<any>(null)
  // 地图加载状态
  const isMapLoaded = ref<MapLoadStatus>(MapLoadStatus.UNLOADED)
  // 全局唯一的GraphicLayer实例
  const graphicLayer = ref<any>(null)
  // 图层是否已初始化
  const isLayerInitialized = ref(false)
  // 使用Map缓存图形对象，优化查找性能（从O(n)降到O(1)）
  const graphicMap = new Map<string, any>()

  // 计算地图状态信息
  const mapStatus = computed(() => {
    return MAP_STATUS_MAP[isMapLoaded.value] || MAP_STATUS_MAP.default
  })

  // 设置地图加载状态的方法
  const setMapLoadSta = (status: MapLoadStatus) => {
    isMapLoaded.value = status
  }

  const resetMapLoadSta = () => {
    isMapLoaded.value = MapLoadStatus.UNLOADED
  }

  /**
   * 设置地图对象
   * @param mapInstance 地图实例
   */
  const setMap = (mapInstance: any) => {
    map.value = mapInstance
  }

  const getMap = () => {
    return map.value
  }

  /**
   * 获取或初始化GraphicLayer实例
   * 确保只创建一次图层实例
   * @returns GraphicLayer实例
   */
  const getOrCreateGraphicLayer = () => {
    // 如果地图未初始化，返回null
    if (!map.value) {
      console.warn('地图对象未初始化，无法创建GraphicLayer')
      return null
    }

    // 如果图层已初始化，直接返回现有实例
    if (isLayerInitialized.value && graphicLayer.value) {
      return graphicLayer.value
    }

    // 创建新的图层实例
    graphicLayer.value = new mars3d.layer.GraphicLayer({
      allowDrillPick: true // 如果存在坐标完全相同的图标点，可以打开该属性，click事件通过graphics判断
    })
    
    // 添加图层到地图
    map.value.addLayer(graphicLayer.value)
    
    // 标记图层已初始化
    isLayerInitialized.value = true
    
    return graphicLayer.value
  }

  /**
   * 清除图层中的所有图形
   */
  const clearLayer = () => {
    if (graphicLayer.value) {
      graphicLayer.value.clear()
    }
  }

  /**
   * 重置图层状态
   */
  const resetLayer = () => {
    // 如果已有图层，从地图中移除
    if (graphicLayer.value && map.value) {
      map.value.removeLayer(graphicLayer.value)
    }
    
    // 重置状态
    graphicLayer.value = null
    isLayerInitialized.value = false
  }

  // 返回状态、计算属性和方法
  return {
    // 地图状态相关
    mapStatus,
    setMapLoadSta,
    resetMapLoadSta,
    // 地图对象和图层管理相关
    map,
    graphicLayer,
    isLayerInitialized,
    graphicMap,
    setMap,
    getMap,
    getOrCreateGraphicLayer,
    clearLayer,
    resetLayer
  }
})