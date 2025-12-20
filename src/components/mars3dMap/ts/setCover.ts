import * as mars3d from "mars3d"
import { useMapStore } from '@/stores/modules/mapStore'

export function setCover() {
  // 获取地图store实例
  const mapStore = useMapStore()

  // 生成唯一ID的前缀
  const CIRCLE_ID_PREFIX = 'circle_'

  const setThreeCircles = (options: { position: number[], radius: number[], text: string[] }) => {
    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    const point = options.position
    
    // 生成唯一ID
    const circleId1 = `${CIRCLE_ID_PREFIX}1`
    const circleId2 = `${CIRCLE_ID_PREFIX}2`
    const circleId3 = `${CIRCLE_ID_PREFIX}3`

    // 创建第一个圈（打击圈）
    const graphicN = new mars3d.graphic.EllipsoidEntity({
      position: point,
      style: {
        radii: options.radius[0],
        maximumConeDegree: 90,
        color: "rgba(231,6,16,0.2)",
        label: {
          text: options.text[0],
          color: "blue",
          background: true,
          backgroundColor: "rgba(255,255,255,0.4)",
          setHeight: options.radius[0],
          visibleDepth: false,
          distanceDisplayCondition: true,
          distanceDisplayCondition_far: 100000
        }
      },
      attr: { id: circleId1, type: 'circle', name: '打击圈' }
    })
    graphicLayer.addGraphic(graphicN)
    // 存储到缓存
    mapStore.graphicMap.set(circleId1, graphicN)

    // 创建第二个圈（预警圈）
    const graphicZ = new mars3d.graphic.EllipsoidEntity({
      position: point,
      style: {
        radii: options.radius[1],
        maximumConeDegree: 90,
        color: "rgba(26,144,255,0.2)",
        label: {
          text: options.text[1],
          color: "blue",
          background: true,
          backgroundColor: "rgba(255,255,255,0.4)",
          setHeight: options.radius[1],
          visibleDepth: false,
          distanceDisplayCondition: true,
          distanceDisplayCondition_far: 100000
        }
      },
      attr: { id: circleId2, type: 'circle', name: '预警圈' }
    })
    graphicLayer.addGraphic(graphicZ)
    // 存储到缓存
    mapStore.graphicMap.set(circleId2, graphicZ)

    // 创建第三个圈（探测圈）
    const graphicW = new mars3d.graphic.EllipsoidEntity({
      position: point,
      style: {
        radii: options.radius[2],
        maximumConeDegree: 90,
        color: "rgba(82,196,26,0.2)",
        label: {
          text: options.text[2],
          color: "blue",
          background: true,
          backgroundColor: "rgba(255,255,255,0.4)",
          setHeight: options.radius[2],
          visibleDepth: false,
          distanceDisplayCondition: true,
          distanceDisplayCondition_far: 100000
        }
      },
      attr: { id: circleId3, type: 'circle', name: '探测圈' }
    })
    graphicLayer.addGraphic(graphicW)
    // 存储到缓存
    mapStore.graphicMap.set(circleId3, graphicW)

    // 返回创建的三个圈的ID
    return { circleId1, circleId2, circleId3 }
  }

  /**
   * 显示指定ID的圈
   * @param circleId 圈的ID
   */
  const showCircle = (circleId: string) => {
    const graphic = mapStore.graphicMap.get(circleId)
    if (graphic) {
      graphic.show = true
    }
  }

  /**
   * 隐藏指定ID的圈
   * @param circleId 圈的ID
   */
  const hideCircle = (circleId: string) => {
    const graphic = mapStore.graphicMap.get(circleId)
    if (graphic) {
      graphic.show = false
    }
  }

  /**
   * 显示所有三个圈
   */
  const showAllCircles = () => {
    for (let i = 1; i <= 3; i++) {
      showCircle(`${CIRCLE_ID_PREFIX}${i}`)
    }
  }

  /**
   * 隐藏所有三个圈
   */
  const hideAllCircles = () => {
    for (let i = 1; i <= 3; i++) {
      hideCircle(`${CIRCLE_ID_PREFIX}${i}`)
    }
  }

  /**
   * 切换指定ID圈的显示状态
   * @param circleId 圈的ID
   */
  const toggleCircle = (circleId: string) => {
    const graphic = mapStore.graphicMap.get(circleId)
    if (graphic) {
      graphic.show = !graphic.show
    }
  }

  return {
    setThreeCircles,
    showCircle,
    hideCircle,
    showAllCircles,
    hideAllCircles,
    toggleCircle,
    // 导出ID常量，方便外部使用
    CIRCLE_ID_PREFIX
  }
}