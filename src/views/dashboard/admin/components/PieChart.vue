<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  created() {

  },
  mounted() {
    // this.loadData()
    this.initChart()
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHandler)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        title: {
          text: '性别统计',
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: this.$store.state.statistics.genderStatistics.name
        },
        calculable: true,
        series: [
          {
            name: 'WEEKLY WRITE ARTICLES',
            type: 'pie',
            radius: '55%',
            center: ['50%', '38%'],
            data: this.$store.state.statistics.genderStatistics,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    },
    loadData() {
      alert(JSON.stringify(this.$store.state.statistics.genderStatistics))
      if (this.$store.state.statistics.genderStatistics == null) {
        this.$store.dispatch('getStatistic').then(res => {
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }
}
</script>
