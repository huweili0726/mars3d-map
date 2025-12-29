import * as mars3d from "mars3d"
import * as Cesium from 'mars3d-cesium'
import { useMapStore } from '@/stores/modules/mapStore'

export function geometryConfig() {
  // 获取地图store实例
  const mapStore = useMapStore()

  /**
   * 设置圆锥体
   * @param options 圆锥体配置项
   * @param options.id 圆锥体ID
   * @param options.lng 经度
   * @param options.lat 纬度
   * @param options.height 高度
   * @param options.heading heading角度
   * @param options.pitch pitch角度
   * @returns 
   */
  const setCone = (options: { 
    id: string, 
    lng: number, 
    lat: number, 
    height?: number,
    heading?: number,
    pitch?: number,
  }) => {
    const { id, lng, lat, height, heading, pitch } = options

    const map = mapStore.getMap()
    if (!map || !map.viewer) {
      console.error('地图或查看器未初始化')
      return
    }

    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    if (!graphicLayer) {
      return null
    }

    // 从graphicMap缓存中直接获取点位（O(1)复杂度）
    let targetGraphic = mapStore.graphicMap.get(id)
    if (targetGraphic) {
      // 如果存在，直接更新位置
      // targetGraphic.position = new mars3d.LngLatPoint(lng, lat, height || 0)
      return true
    }

    // 从图层中获取或创建ConeEntity
    const conicSensor = new mars3d.graphic.ConicSensor({
      position: [lng, lat, height || 0],
      style: {
        angle: 5,
        length: 1000,
        heading: heading || 0,
        pitch: pitch || 40,
        roll: 0,
        color: "rgba(255,0,0,0.4)",
        outlineColor: "rgba(255,255,255,0.9)",
        flat: true
      }
    })
    graphicLayer.addGraphic(conicSensor)
    mapStore.graphicMap.set(id, conicSensor)
  }

  /**
   * 更新圆锥体
   * @param options 圆锥体配置项
   * @param options.id 圆锥体ID
   * @param options.lng 经度
   * @param options.lat 纬度
   * @param options.height 高度
   * @param options.heading heading角度
   * @param options.pitch pitch角度
   * @returns 
   */
  const updateCone = (options: { 
    id: string, 
    lng?: number, 
    lat?: number, 
    height?: number,
    heading?: number,
    pitch?: number,
  }) => {
    const { id, lng, lat, height, heading, pitch } = options
    const conicSensor = mapStore.graphicMap.get(id)
    if (!conicSensor) {
      console.error(`ID为${id}的圆锥体不存在`)
      return
    }
    // conicSensor.position = new mars3d.LngLatPoint(lng, lat, height || 0)

    conicSensor.setStyle({
      heading: heading || 0,
      pitch: pitch || 40,
    })
  }

  return {
    setCone,
    updateCone
  }
}