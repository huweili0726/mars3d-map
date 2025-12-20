import * as mars3d from "mars3d"
import * as Cesium from 'mars3d-cesium'
import { useMapStore } from '@/stores/modules/mapStore'


export function playback() {
  // 获取地图store实例
  const mapStore = useMapStore()

  let fixedRoute: mars3d.graphic.FixedRoute | null = null;

  /**
   * 回放无人机轨迹
   * @param arrPnts 无人机轨迹数据数组 格式：[{sn: 设备序列号, time: 时间戳, lng: 经度, lat: 纬度, alt: 高度, heading: 方向角度, pitch: 俯仰角度, roll: 横滚角度, camera: {pitch, roll, heading, zoom}}]
   * 例如：[{sn: "DRONE001", time: "2023-12-01 10:00:00", lng: 117.233619, lat: 31.716288, alt: 203.17, heading: -90, pitch: -0.9, roll: 0.2, camera: {pitch: 0, roll: 0, heading: -95, zoom: 0.5678}}]
   */
  const playbackDroneRoute = (glbUrl: string, arrPnts: any) => {
    const map = mapStore.getMap();

    if (!map || !map.viewer || !map.viewer.clock) {
      console.error('地图或时钟未初始化')
      return
    }

    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()

    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    // 清理已存在的路线实例，避免重复性设置
    // if (fixedRoute && graphicLayer) {
    //   fixedRoute.stop();
    //   graphicLayer.removeGraphic(fixedRoute);
    //   fixedRoute = null;
    // }

    // 渲染路线
    fixedRoute = new mars3d.graphic.FixedRoute({
      name: "飞机航线",
      position: {
        type: "time", // 时序动态坐标
        timeField: "time",
        list: arrPnts
      },
      label: {
        text: "火星无人机",
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
      model: {
        url: glbUrl,
        scale: 1,
        minimumPixelSize: 100,
        pitch: 0 // 固定角度
      },
      path: {
        // leadTime: 0 ,//不显示未飞行过的
        width: 4,
        color: "rgba(52, 187, 212, 0.6)"
        // materialType: mars3d.MaterialType.LineFlow,
        // materialOptions: {
        //   color: "#ffffff",
        //   image: "https://data.mars3d.cn/img/textures/arrow-small.png",
        //   repeat: new Cesium.Cartesian2(500, 1),
        //   speed: 10,
        //   bgColor: "rgba(52, 187, 212, 0.6)"
        // }
      },
      clockRange: Cesium.ClockRange.CLAMPED, // 到达终点后停止
      // flyTo: true
    })
    graphicLayer.addGraphic(fixedRoute)

    fixedRoute.start()

    // 修改控件对应的时间
    if (map.control.timeline) {
      map.control.timeline.zoomTo(fixedRoute.startTime, fixedRoute.stopTime)
    }

    // 添加一些联动的矢量对象
    addIndexNumPoint(arrPnts)
  }

  // 添加路线的数字点位标识
  const addIndexNumPoint = async (arr) => {
    // 从store获取或创建GraphicLayer实例
    const graphicLayer = mapStore.getOrCreateGraphicLayer()

    // 如果图层获取失败，返回null
    if (!graphicLayer) {
      return null
    }

    for (let i = 0; i < arr.length; i++) {
      const idx = i + 1
      const graphic = new mars3d.graphic.BillboardPrimitive({
        position: arr[i],
        style: {
          image: await getMarkerImg(idx),
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        },
        attr: { index: idx }
      })
      graphicLayer.addGraphic(graphic)
    }
  }

  // 获取数字标识图标
  let indexMark
  const getMarkerImg = async (num) => {
    if (!indexMark) {
      indexMark = await Cesium.Resource.fetchImage({ url: "https://data.mars3d.cn/img/marker/bg/poi-num.png" })
    }

    const canvas = document.createElement("canvas")
    canvas.width = 19
    canvas.height = 25
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(indexMark, 0, 0) // 绘制图片

    // 绘制文字
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px 楷体"
    ctx.textBaseline = "middle"
    ctx.fillText(num, num < 10 ? 6 : 3, 10)

    return canvas.toDataURL("image/png")
  }

  return {
    playbackDroneRoute
  }
}
