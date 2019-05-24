<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('userList')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <!--<div class="card-panel-text">{{ $t('i18nView.applications') }}</div>-->
          <div v-if="roles.includes('admin')" class="card-panel-text">注册总人数</div>
          <div v-else class="card-panel-text">{{ $t('i18nView.applications') }}</div>
          <count-to :start-val="0" :end-val="count1" :duration="2600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('applyList')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <!--<div class="card-panel-text">{{ $t('i18nView.confirms') }}</div>-->
          <div v-if="roles.includes('admin')" class="card-panel-text">社团总数</div>
          <div v-else class="card-panel-text">{{ $t('i18nView.confirms') }}</div>
          <count-to :start-val="0" :end-val="count2" :duration="3000" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('noticeList')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">{{ $t('i18nView.fileTemplate') }}</div>
          <count-to :start-val="0" :end-val="count3" :duration="3200" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('templateList')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="shopping" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">{{ $t('i18nView.article') }}</div>
          <count-to :start-val="0" :end-val="count4" :duration="3600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import store from '@/store'
import { count } from '@/api/userMethod'
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      count1: 0,
      count2: 0,
      count3: 0,
      count4: 0,
      countList: [],
      countList2: [],
      countList4: [],
      countList3: [],
      date: [],
      date2: [],
      date3: [],
      date4: [],
      roles: null
    }
  },
  created() {
    this.loadCountData()
    const roles = store.getters && store.getters.roles
    this.roles = roles
  },
  methods: {
    handleSetLineChartData(type) {
      // this.$emit('handleSetLineChartData', type)
      var temp = {}
      if (type === 'userList') {
        temp = {
          expectedData: this.handlerExpect(this.countList),
          actualData: this.countList,
          chartDataX: this.date
        }
      } else if (type === 'applyList') {
        temp = {
          expectedData: this.handlerExpect(this.countList2),
          actualData: this.countList2,
          chartDataX: this.date2
        }
      } else if (type === 'noticeList') {
        temp = {
          expectedData: this.handlerExpect(this.countList3),
          actualData: this.countList3,
          chartDataX: this.date3
        }
      } else {
        temp = {
          expectedData: this.handlerExpect(this.countList4),
          actualData: this.countList4,
          chartDataX: this.date4
        }
      }
      this.$emit('handleSetLineChartData', temp)
    },
    loadCountData() {
      return new Promise((resolve, reject) => {
        count().then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取社团列表失败!')
          }
          if (response.data.code === 200) {
            this.count1 = response.data.count.total
            this.count2 = response.data.count2.total
            this.count3 = response.data.count3.total
            this.count4 = response.data.count4.total
            this.countList = response.data.count.count
            this.countList2 = response.data.count2.count
            this.countList3 = response.data.count3.count
            this.countList4 = response.data.count4.count
            this.date = response.data.count.date
            this.date2 = response.data.count2.date
            this.date3 = response.data.count3.date
            this.date4 = response.data.count4.date
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    handlerExpect(arr) {
      const arr1 = []
      Object.assign(arr1, arr)
      arr1.map(function(value, index) {
        arr1[index] = value + 1
      })
      return arr1
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col{
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shopping {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shopping {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
