<template>
  <!-- 地图加载状态指示器 -->
  <div class="map-status-indicator">
    地图加载状态：{{ mapStore.mapStatus?.info || '未知状态' }}
  </div>
  
  <!-- 点位控制按钮 -->
  <div class="map-controls">
    <div class="button-group">
      <button @click="handleMovePoint1" class="control-btn">移动点位1(直接img)</button>
      <button @click="handleMovePoint2" class="control-btn">移动点位2(图片、文字放div里)</button>
      <button @click="handleMovePoint3" class="control-btn">移动车</button>
      <button @click="handleMovePoint4" class="control-btn">移动无人机1</button>
      <button @click="handleMovePoint5" class="control-btn">移动无人机2</button>
      <button @click="handleMovePoint6" class="control-btn">回放无人机轨迹</button>
      <button @click="handleMovePoint7" class="control-btn">圆锥体</button>
      <button @click="pauseConeUpdate" class="control-btn">暂停圆锥体更新</button>
      <button @click="resumeConeUpdate" class="control-btn">继续圆锥体更新</button>
    </div>
  </div>

  <!-- ID删除控制 -->
  <div class="delete-controls">
    <div class="control-group">
      <input type="text" v-model="graphicId" placeholder="输入ID" class="control-input">
      <button @click="clearGraphicById(graphicId)" class="control-btn">根据ID删除</button>
    </div>
  </div>
  
  <!-- 圆圈控制按钮 -->
  <div class="circle-controls">
    <div class="button-group">
      <h3>圆圈控制</h3>
      <div class="circle-buttons">
        <h4>单个控制</h4>
        <div class="btn-row">
          <button @click="handleToggleCircle('circle_1')" class="control-btn">切换打击圈</button>
        </div>
        <div class="btn-row">
          <button @click="handleToggleCircle('circle_2')" class="control-btn">切换预警圈</button>
        </div>
        <div class="btn-row">
          <button @click="handleToggleCircle('circle_3')" class="control-btn">切换探测圈</button>
        </div>
      </div>
      
      <div class="circle-buttons">
        <h4>批量控制</h4>
        <div class="btn-row">
          <button @click="handleShowAllCircles()" class="control-btn">显示所有圈</button>
          <button @click="handleHideAllCircles()" class="control-btn">隐藏所有圈</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { setCover } from '@/components/mars3dMap/ts/setCover'
import { useMapStore } from '@/stores/modules/mapStore';
import { setPoint } from '@/components/mars3dMap/ts/setPoint';
import { playback } from '@/components/mars3dMap/ts/playback';
import { move } from '@/components/mars3dMap/ts/move';
import { geometryConfig } from '@/components/mars3dMap/ts/geometry';

const mapStore = useMapStore();
const graphicId = ref('1'); // 默认值设为1，对应原来的车

const handleMovePoint1 = () => {
  // 在原位置附近随机生成新的坐标
  const newLng = 117.229619 + (Math.random() - 0.5) * 0.01;
  const newLat = 31.716288 + (Math.random() - 0.5) * 0.01;
  
  // 调用movePoint函数移动点位，使用默认角度0
  movePoint({pointId: '1', lng: newLng, lat: newLat});
  console.log(`点位1移动到: ${newLng.toFixed(6)}, ${newLat.toFixed(6)}`);
};

const handleMovePoint2 = () => {
  // 在原位置附近随机生成新的坐标
  const newLng = 117.236334 + (Math.random() - 0.5) * 0.01;
  const newLat = 31.715287 + (Math.random() - 0.5) * 0.01;
  
  // 调用movePoint函数移动点位，使用默认角度0
  movePoint({pointId: '2', lng: newLng, lat: newLat});
  console.log(`点位2移动到: ${newLng.toFixed(6)}, ${newLat.toFixed(6)}`);
};

const handleMovePoint3 = () => {
  // 在原位置附近随机生成新的坐标
  const newLng = 117.228433 + (Math.random() - 0.5) * 0.01;
  const newLat = 31.723159 + (Math.random() - 0.5) * 0.01;
  
  // 生成随机方向角度 (0-360度)
  const randomHeading = Math.random() * 360;
  
  // 调用movePoint函数移动点位并设置方向角度
  movePoint({pointId: '3', lng: newLng, lat: newLat, height: 0, heading: randomHeading});
  console.log(`车glb模型移动到: ${newLng.toFixed(6)}, ${newLat.toFixed(6)}, 方向角度: ${randomHeading.toFixed(2)}度`);
};

// 添加全局变量来跟踪无人机移动
let currentDirection = 0;
let baseLng = 117.222153;
let baseLat = 31.716917;

const handleMovePoint4 = () => {
  // 生成当前时间
  const now = new Date();
  const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // 更新方向（缓慢旋转）
  currentDirection = (currentDirection + 1) % 360;

  // 计算新的经纬度（以圆形路径移动）
  const radius = 0.01; // 移动半径（度数）
  const angleRad = (currentDirection * Math.PI) / 180;
  const newLng = baseLng + radius * Math.cos(angleRad);
  const newLat = baseLat + radius * Math.sin(angleRad);

  // 准备参数对象
  const params = {
    "sn": "7CTDLA900A0005",
    "time": currentTime,
    "lng": newLng,
    "lat": newLat,
    "alt": 203.17,
    "heading": -47.5,
    "pitch": -0.9,
    "roll": 0.2,
    "camera": {
      "pitch": 0,
      "roll": 0,
      "heading": -47.6,
      "zoom": 0.5678
    }
  };
  updateDroneRoute(params);// 更新无人机路线
}

let currentDirection1 = 10;
let baseLng1 = 117.217388;
let baseLat1 = 31.713561;
const handleMovePoint5 = () => {
  // 生成当前时间
  const now = new Date();
  const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // 更新方向（缓慢旋转）
  currentDirection1 = (currentDirection1 + 1) % 360;

  // 计算新的经纬度（以圆形路径移动）
  const radius = 0.01; // 移动半径（度数）
  const angleRad = (currentDirection1 * Math.PI) / 180;
  const newLng = baseLng1 + radius * Math.cos(angleRad);
  const newLat = baseLat1 + radius * Math.sin(angleRad);
  // 准备参数对象
  const params = {
    "sn": "wertfb1123432489",
    "time": currentTime,
    "lng": newLng,
    "lat": newLat,
    "alt": 203.17,
    "heading": -47.5,
    "pitch": -0.9,
    "roll": 0.2,
    "camera": {
      "pitch": 0,
      "roll": 0,
      "heading": -47.6,
      "zoom": 0.5678
    }
  };
  updateDroneRoute(params);// 更新无人机路线
}

const handleMovePoint6 = () => {
  // 生成第一条轨迹数据（无人机1）
  const generateRoute1 = () => {
    // 第一个中心点坐标（基于index.vue中的第一个点位附近）
    const centerLng1 = 117.229619;
    const centerLat1 = 31.716288;
    const centerAlt1 = 203.17;
    const radius1 = 0.004; // 半径
    let routeArr1 = [];

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const lng = centerLng1 + Math.cos(angle) * radius1;
      const lat = centerLat1 + Math.sin(angle) * radius1;
      const seconds = String(i).padStart(2, '0');
      const time = `2023-12-01 10:00:${seconds}`;
      const heading = Math.atan2(centerLng1 - lng, centerLat1 - lat) * 180 / Math.PI;

      routeArr1.push({
        "sn": "DRONE001", // 无人机1标识
        "time": time,
        "lng": lng,
        "lat": lat,
        "alt": centerAlt1 + Math.sin(angle) * 5,
        "heading": heading,
        "pitch": -0.9,
        "roll": 0.2,
        "camera": {
          "pitch": 0,
          "roll": 0,
          "heading": heading - 5,
          "zoom": 0.5678
        }
      });
    }
    return routeArr1;
  };

  // 生成第二条轨迹数据（无人机2）
  const generateRoute2 = () => {
    // 第二个中心点坐标（基于index.vue中的第二个点位附近）
    const centerLng2 = 117.236334;
    const centerLat2 = 31.715287;
    const centerAlt2 = 210.0;
    const radius2 = 0.004; // 半径
    let routeArr2 = [];

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + Math.PI/2; // 相位差90度，避免轨迹重合
      const lng = centerLng2 + Math.cos(angle) * radius2;
      const lat = centerLat2 + Math.sin(angle) * radius2;
      const seconds = String(i).padStart(2, '0');
      const time = `2023-12-01 10:00:${seconds}`;
      const heading = Math.atan2(centerLng2 - lng, centerLat2 - lat) * 180 / Math.PI;

      routeArr2.push({
        "sn": "DRONE002", // 无人机2标识
        "time": time,
        "lng": lng,
        "lat": lat,
        "alt": centerAlt2 + Math.cos(angle) * 8, // 不同的高度变化模式
        "heading": heading,
        "pitch": -1.0,
        "roll": -0.1,
        "camera": {
          "pitch": 0,
          "roll": 0,
          "heading": heading + 5,
          "zoom": 0.6
        }
      });
    }
    return routeArr2;
  };

  // 生成两条轨迹数据
  const routeArr1 = generateRoute1();
  const routeArr2 = generateRoute2();

  console.log("第一条回放数据格式: ", routeArr1);
  console.log("第二条回放数据格式: ", routeArr2);

  // 同时回放两条轨迹
  playbackDroneRoute(`${process.env.BASE_URL}/glb/drone.glb`, routeArr1); // 回放无人机1轨迹
  playbackDroneRoute(`${process.env.BASE_URL}/glb/drone.glb`, routeArr2); // 回放无人机2轨迹
}

const handleMovePoint7 = () => {
  setCone({
    id: 'cone-1',
    lng: 117.228433,
    lat: 31.723159,
    height: 0,
    heading: 47.5,
    pitch: 50,
  })

  startConeUpdateTimer();
}

// 圆圈控制处理函数
const handleToggleCircle = (circleId: string) => {
  toggleCircle(circleId);
};

const handleShowAllCircles = () => {
  showAllCircles();
};

const handleHideAllCircles = () => {
  hideAllCircles();
};

const {
  clearGraphicById
} = setPoint();

const {
  updateDroneRoute,
  movePoint
} = move();

const {
  playbackDroneRoute
} = playback();

const {
  showAllCircles,
  hideAllCircles,
  toggleCircle
} = setCover();

const { setCone, updateCone } = geometryConfig();

// 定时器变量
let coneTimer: number | null = null;

// 俯仰角变化的角度列表
const pitchValues = [10, 20, 30, 40, 50, 60, 70, 80, 70, 60, 50, 40, 30, 20];
let currentPitchIndex = 0;

// 启动圆锥体俯仰角更新定时器
const startConeUpdateTimer = () => {
  // 先清除可能存在的旧定时器
  if (coneTimer) {
    clearInterval(coneTimer);
  }
  
  // 设置新定时器，每秒更新一次俯仰角
  coneTimer = window.setInterval(() => {
    // 获取当前俯仰角
    const currentPitch = pitchValues[currentPitchIndex];
    
    // 更新圆锥体
    updateCone({
      id: 'cone-1',
      heading: 47.5,
      pitch: currentPitch,
    });
    
    // 更新索引，循环使用角度列表
    currentPitchIndex = (currentPitchIndex + 1) % pitchValues.length;
  }, 1000);
};

// 停止圆锥体俯仰角更新定时器
const stopConeUpdateTimer = () => {
  if (coneTimer) {
    clearInterval(coneTimer);
    coneTimer = null;
  }
};

// 暂停圆锥体更新（暂停定时器）
const pauseConeUpdate = () => {
  stopConeUpdateTimer();
};

// 继续圆锥体更新（继续定时器）
const resumeConeUpdate = () => {
  startConeUpdateTimer();
};
// 组件卸载时清除定时器
onUnmounted(() => {
  stopConeUpdateTimer();
});
</script>

<style scoped>
.map-status-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #0a192f 0%, #172a45 100%);
  color: #64ffda;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  border: 1px solid rgba(100, 255, 218, 0.3);
  backdrop-filter: blur(5px);
}

.map-controls {
  position: absolute !important;
  top: 60px !important;
  left: 10px !important;
  z-index: 1000 !important;
}

.map-controls .button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.delete-controls {
  position: absolute !important;
  top: 120px !important;
  left: 10px !important;
  z-index: 1000 !important;
}

.control-btn {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.control-btn:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  transform: translateY(-2px);
  border-color: #69c0ff;
}

.control-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.control-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  width: 100px;
}

.control-input:focus {
  border-color: rgba(24, 144, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 圆圈控制按钮样式 */
.circle-controls {
  position: absolute !important;
  top: 14px !important;
  right: 10px !important;
  z-index: 1000 !important;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.circle-controls h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #1890ff;
  text-align: center;
}

.circle-controls h4 {
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 4px;
}

.circle-buttons {
  margin-bottom: 15px;
}

.btn-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.btn-row button {
  flex: 1;
  min-width: 100px;
}
</style>