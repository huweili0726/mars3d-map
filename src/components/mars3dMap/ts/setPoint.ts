import * as mars3d from "mars3d"
import * as Cesium from 'mars3d-cesium'
import { useMapStore } from '@/stores/modules/mapStore'

export function setPoint() {
  // 获取地图store实例
  const mapStore = useMapStore()

  /**
   * 设置点位 （直接把图片设置成点位）
   * @param options 配置选项
   * @param options.id 点位唯一标识
   * @param options.lng 经度
   * @param options.lat 纬度
   * @returns 创建的点位对象
   */
  const setPointByImg = (options: { id: string, lng: number, lat: number }) => {
    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    // 生成唯一ID如果未提供
    const pointId = options.id || `img_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const graphic = new mars3d.graphic.BillboardEntity({
      position: new mars3d.LngLatPoint(options.lng, options.lat, 0),
      style: {
        image: new URL('@/assets/img/point.png', import.meta.url).href,
        scale: 1.0,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        clampToGround: true,
        label: { text: "鼠标移入会放大", pixelOffsetY: -50 },
        // 高亮时的样式（默认为鼠标移入，也可以指定type:'click'单击高亮），构造后也可以openHighlight、closeHighlight方法来手动调用
        highlight: {
          scale: 1.5
        }
      },
      attr: { remark: "示例2", id: pointId }
    })
    graphicLayer.addGraphic(graphic) 
    // 将创建的图形添加到Map缓存中，用于后续快速查找
    if (pointId) {
      mapStore.graphicMap.set(pointId, graphic)
    }
    return graphic
  }

  /**
   * 设置点位 （通过绘制div把图片塞进去设置成点位）
   * @param options 配置选项
   * @param options.id 点位唯一标识
   * @param options.lng 经度
   * @param options.lat 纬度
   * @returns 创建的点位对象
   */
  const setPointByDiv = (options: { id: string, lng: number, lat: number }) => {
    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    // 生成唯一ID如果未提供
    const pointId = options.id || `div_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const graphic = new mars3d.graphic.DivGraphic({
      position: [options.lng, options.lat, 0],
      style: {
          html: `<div class="inspection-class">
                  <div class="inspection-item">
                   <div>${Number(options.lng).toFixed(2)}, ${Number(options.lat).toFixed(2)}</div>
                  </div>
               </div>`,
          offsetY: 0,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 400000), // 按视距距离显示

          // 高亮时的样式
          highlight: {
            type: mars3d.EventType.click,
            className: "marsBlueGradientPnl-highlight"
          }
        },
      attr: { id: pointId }
    })
    graphicLayer.addGraphic(graphic) 
    // 将创建的图形添加到Map缓存中，用于后续快速查找
    if (pointId) {
      mapStore.graphicMap.set(pointId, graphic)
    }
    return graphic
  }
  
  /**
   * 设置点位 （通过提供的glb模型设置点位）
   * @param options 配置选项
   * @param options.type 点位类型，用于区分不同的点位 
   * @param options.id 点位唯一标识
   * @param options.url glb模型URL
   * @param options.lng 经度
   * @param options.lat 纬度
   * @param options.height 点位高度
   * @param options.heading glb模型水平方位向角度
   * @returns 创建的点位对象
   */
  const setPointByGlb = (options: { type?: string, id: string, url: string, lng: number, lat: number, height: number, heading: number }) => {
    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    // 生成唯一ID如果未提供
    const pointId = options.id || `glb_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const graphic = new mars3d.graphic.ModelEntity({
        position: [options.lng, options.lat, options.height],
        style: {
            url: options.url,
            scale: 1.2,
            minimumPixelSize: 80,
            heading: options.heading          
        },
        attr: { id: pointId, type: options?.type }
    })
    graphicLayer.addGraphic(graphic) 
    // 将创建的图形添加到Map缓存中，用于后续快速查找
    if (pointId) {
      mapStore.graphicMap.set(pointId, graphic)
    }
    return graphic
  }

  /**
   * 清除指定ID的图形
   * @param id 可选，指定要清除的图形id，如果不提供则清除所有图形
   * @returns 清除的图形数量
   */
  const clearGraphicById = (id?: string) => {
    // 从store获取GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回0
    if (!graphicLayer) {
      console.warn('清除图形失败：图层未初始化')
      return 0
    }

    // 要删除的图形列表
    let toRemoveGraphics: any[] = []
    
    if (id) {
      // 如果提供了id，优先从Map缓存中查找（O(1)复杂度）
      let targetGraphic = mapStore.graphicMap.get(id)
      
      // 如果Map中没有找到，再从图层中查找（O(n)复杂度）
      if (!targetGraphic) {
        const graphics = graphicLayer.getGraphics()
        targetGraphic = graphics.find(
          graphic => graphic.attr?.id === id
        )
      }
      
      if (targetGraphic) {
        toRemoveGraphics.push(targetGraphic)
        // 从Map缓存中移除
        mapStore.graphicMap.delete(id)
      }
    } else {
      // 如果没有提供id，清除所有图形
      const graphics = graphicLayer.getGraphics()
      toRemoveGraphics = [...graphics]
      // 清除所有缓存
      mapStore.graphicMap.clear()
    }
    
    // 清除找到的图形
    toRemoveGraphics.forEach(graphic => {
      graphicLayer.removeGraphic(graphic)
    })
    
    return toRemoveGraphics.length
  }

  // 新增清除图层方法，方便外部调用
  const clearLayer = () => {
    mapStore.clearLayer()
    // 清除图层时同时清除缓存
    mapStore.graphicMap.clear()
  }

  // 重置图层方法
  const resetLayer = () => {
    mapStore.resetLayer()
    // 重置图层时同时清除缓存
    mapStore.graphicMap.clear()
  }

  /**
   * 清除指定ID的图形缓存
   * @param graphicId 图形ID
   */
  const removeGraphicFromCache = (graphicId: string) => {
    if (graphicId) {
      mapStore.graphicMap.delete(graphicId)
    }
  }

  /**
   * 清除所有图形缓存
   */
  const clearGraphicCache = () => {
    mapStore.graphicMap.clear()
  }

  return {
    setPointByImg,
    setPointByDiv,
    setPointByGlb,
    clearLayer,
    resetLayer,
    clearGraphicById,
    removeGraphicFromCache,
    clearGraphicCache
  }
}