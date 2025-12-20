import * as Cesium from 'mars3d-cesium'
import { useMapStore } from '@/stores/modules/mapStore'

/**
 * map相关工具函数
 * @returns 
 */
export function mapUtils() {
  // 获取地图store实例
  const mapStore = useMapStore()

  /**
   * 根据经纬度、方向、距离，计算另一个点的经纬度坐标
   * @param { number } lng 经度
   * @param { number } lat 纬度
   * @param { number } angle 方向角度
   * @param { number } length 距离(单位：米)
   * @returns 
   */
  const getNextPosition = (lng: number, lat: number, angle: number, length: number) => {
    let cartesian3 = Cesium.Cartesian3.fromDegrees(lng, lat);
    let transform = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian3);
    let matrix3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle || 0));
    let rotationZ = Cesium.Matrix4.fromRotationTranslation(matrix3);
    Cesium.Matrix4.multiply(transform, rotationZ, transform);
    let result = Cesium.Matrix4.multiplyByPoint(transform, new Cesium.Cartesian3(0, length, 0), new Cesium.Cartesian3());
    return result;
  }

  /**
   * 世界坐标转经纬度
   * @param { mars3d.Map } map 
   * @param { Cesium.Cartesian3 } cartesian3 
   */
  const toDegrees = (map: any, cartesian3: Cesium.Cartesian3) => {
    // 世界坐标转换为弧度
    let ellipsoid = map.scene.globe.ellipsoid;
    let cartographic = ellipsoid.cartesianToCartographic(cartesian3);

    // 弧度转换为经纬度
    let lng = Cesium.Math.toDegrees(cartographic.longitude);  // 经度
    let lat = Cesium.Math.toDegrees(cartographic.latitude);   // 纬度
    let alt = cartographic.height;	// 高度

    return { lng, lat, alt }
  }

  /**
   * 2维、3维地图切换
   */
  const switchTo2D3D = () => {
    let map = mapStore.getMap();
    if (!map) return

    let view = map.getCameraView()
    if (map.scene.mode == Cesium.SceneMode.SCENE3D) {
      let pitch = ((0 - view.pitch) * Math.PI) / 180
      let length = view.alt / Math.tan(pitch)
      let newAlt = view.alt / Math.sin(pitch)
      let pos = getNextPosition(view.lng, view.lat, 0 - view.heading, length)
      let pos2 = toDegrees(map, pos)
      map.setCameraView(
        {
          lng: pos2.lng,
          lat: pos2.lat,
          alt: newAlt
        },
        {
          complete: () => {
            map.scene.mode = Cesium.SceneMode.SCENE2D
          },
          duration: 1.5
        }
      )
    } else {
      map.scene.mode = Cesium.SceneMode.SCENE3D
      let pitch = (30 * Math.PI) / 180
      let length = view.alt * Math.cos(pitch)
      let newAlt = view.alt * Math.sin(pitch)
      let pos = getNextPosition(view.lng, view.lat, 180 - view.heading, length)
      let pos2 = toDegrees(map, pos)
      map.setCameraView(
        {
          lng: pos2.lng,
          lat: pos2.lat,
          alt: newAlt,
          heading: view.heading,
          pitch: -30
        },
        {
          duration: 1.5
        }
      )
    }
  }

  /**
   * 获取相机视图位置
   * @param position 相机位置 [lng, lat, alt]
   * @param length 距离(单位：米)
   * @param pitch 俯仰角度(默认：-45)
   * @returns 
   */
  const getCameraViewPosition = (position: number[], length: number, pitch = -45) => {
    let map = mapStore.getMap();
    if (!map) return

    if (map.scene.mode == Cesium.SceneMode.SCENE3D) {
        let heading = 0;
        let pitch2 = (Math.abs(pitch) * Math.PI) / 180;
        let newAlt = position[2] + length * Math.sin(pitch2);
        let pos = getNextPosition(position[0], position[1], 180 - heading, length * Math.cos(pitch2));
        let pos2 = toDegrees(map, pos);
        return {
            lng: pos2.lng,
            lat: pos2.lat,
            alt: newAlt,
            heading: heading,
            pitch: pitch
        };
    } else if (map.scene.mode == Cesium.SceneMode.SCENE2D) {
        return {
            lng: position[0],
            lat: position[1],
            alt: position[2] + 10000
        };
    }
  }

  /**
   * 设置地图中心相机视图
   * @param position 相机位置 [lng, lat, alt]
   */
  const setMapCenterCameraView = (position: number[], length: number) => {
    let map = mapStore.getMap();
    if (!map) return

    let view = getCameraViewPosition(position, length);
    map.setCameraView(view, { duration: 1.5 });
  }

  return {
    switchTo2D3D,
    setMapCenterCameraView
  }
}


