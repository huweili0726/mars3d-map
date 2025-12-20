import * as mars3d from "mars3d"
import * as Cesium from 'mars3d-cesium'
import { useMapStore } from '@/stores/modules/mapStore'

export function move() {
  // 获取地图store实例
  const mapStore = useMapStore()

  /**
   * 移动点位到新的坐标位置
   * @param options 配置选项
   * @param options.pointId 点位唯一标识
   * @param options.lng 新的经度
   * @param options.lat 新的纬度
   * @param options.height 高度
   * @param options.heading 方向角度（水平方向）
   * @param options.pitch 俯仰角度
   * @returns 是否移动成功
   */
  const movePoint = (options: { 
    pointId: string, 
    lng: number, 
    lat: number, 
    height?: number,
    heading?: number,
    pitch?: number,
  }) => {
    // 从store获取GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回false
    if (!graphicLayer) {
      console.warn('移动点位失败：图层未初始化')
      return false
    }

    // 从graphicMap缓存中直接获取点位（O(1)复杂度）
    let targetGraphic = mapStore.graphicMap.get(options.pointId)
    
    // 如果在缓存中未找到，再尝试从图层中查找作为后备方案
    if (!targetGraphic) {
      console.warn(`从缓存中未找到ID为${options.pointId}的点位，尝试从图层中查找`)
      const graphics = graphicLayer.getGraphics()
      const layerGraphic = graphics.find(graphic => graphic.attr?.id === options.pointId)
      // 如果在图层中找到，同时更新缓存
      if (layerGraphic) {
        mapStore.graphicMap.set(options.pointId, layerGraphic)
        targetGraphic = layerGraphic
      }
    }
    
    if (!targetGraphic) {
      console.warn(`未找到ID为${options.pointId}的点位`)
      return false
    }

    try {
      // glb模型
      if (targetGraphic instanceof mars3d.graphic.ModelEntity) {
        // 更新glb模型的水平方位角
        targetGraphic.style.heading = options.heading;
      }
      
      // 如果是DivGraphic/BillboardEntity，更新显示的坐标
      if (targetGraphic instanceof mars3d.graphic.DivGraphic || targetGraphic instanceof mars3d.graphic.BillboardEntity) {
        // 更新显示的坐标文本
        const html = `<div class="inspection-class">
                        <div class="inspection-item">
                          <div>${Number(options.lng).toFixed(2)}, ${Number(options.lat).toFixed(2)}</div>
                        </div>
                      </div>`
        targetGraphic.style.html = html;
      }

      // 更新位置
      targetGraphic.position = new mars3d.LngLatPoint(options.lng, options.lat, options.height || 0);
      
      return true
    } catch (error) {
      console.error('移动点位时发生错误：', error)
      return false
    }
  }

  /**
   * 更新无人机路线（没有构造时自动添加对象）
   * @param item 无人机路线数据项
   * @returns 
   */
  const updateDroneRoute = (item: object) => { 
    const map = mapStore.getMap();
    if (!map || !map.viewer || !map.viewer.clock) {
      console.error('地图或时钟未初始化')
      return
    }
    
    // 重置时钟到实时模式
    const clock = map.viewer.clock;
    if (clock) {
      clock.clockRange = Cesium.ClockRange.UNBOUNDED; // 设置为无限制模式
      clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // 使用系统时钟
      clock.multiplier = 1.0; // 正常速度
      clock.currentTime = Cesium.JulianDate.now(); // 设置当前时间
    }
    
    // 重置时间轴控件
    if (map.control && map.control.timeline) {
      // 取消时间轴的缩放限制
      const now = Cesium.JulianDate.now();
      const future = Cesium.JulianDate.addSeconds(now, 60, new Cesium.JulianDate()); // 显示未来1分钟
      map.control.timeline.zoomTo(now, future);
    }

    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()
    
    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    const graphicId = (item as any)?.sn
    let route = graphicLayer.getGraphicById(graphicId)
    if (!route) {
      // 绘制无人机
      route = new mars3d.graphic.Route({
        id: graphicId,
        model: {
          url: `${process.env.BASE_URL}/glb/drone.glb`,
          scale: 1,
          minimumPixelSize: 100,
          pitch: 0 // 固定角度
        },
        label: {
          text: "无人机" + graphicId,
          font_size: 30,
          scale: 0.5,
          font_family: "宋体",
          color: "#ffffff",
          background: true,
          backgroundColor: "rgba(0,0,0,0.5)",
          pixelOffsetY: -35,
          distanceDisplayCondition: true,
          distanceDisplayCondition_far: 100000,
          visibleDepth: false
        },
        path: {
          leadTime: 0, // 不显示未飞行过的
          trailTime: 10,   // ★ 已飞路径只保留最近 10 秒    
          width: 2,
          color: "rgba(255, 255, 0, 0.7)"
        },
        flyTo: true,
        attr: { id: graphicId }
      })
      graphicLayer.addGraphic(route)
    }

    const position = Cesium.Cartesian3.fromDegrees((item as any).lng, (item as any).lat, (item as any).alt)
    route.addTimePosition(position, (item as any).time)
  }

  return {
    movePoint,
    updateDroneRoute
  }
}
