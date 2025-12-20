import "mars3d-cesium/Build/Cesium/Widgets/widgets.css"
import "mars3d/mars3d.css"
import "font-awesome/css/font-awesome.css"

import "mars3d"

import "mars3d-space"
import "mars3d-heatmap"
import "mars3d-echarts"
import "mars3d-mapv"

import { createApp } from 'vue'
import './assets/css/global.css'
import './assets/css/map.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')