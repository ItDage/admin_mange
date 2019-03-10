<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      :id.sync = "id"
      :before-close="handleClose"
      title="活动人员列表"
      width="50%">
      <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
          :label="$t('i18nView.username')"
          prop="username"
          width="180"/>
        <el-table-column
          :label="$t('i18nView.email')"
          prop="email"
          width="180"/>
        <el-table-column
          :label="$t('i18nView.gender')"
          prop="gender">
          <template slot-scope="scope">
            <span v-if="scope.row.gender === '1'">男</span>
            <span v-if="scope.row.gender === '0'">女</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('i18nView.phone')"
          prop="phone"/>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { join } from '@/api/activity'
import local from '@/views/i18n-demo/local'
const viewName = 'i18nView'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tableData: [],
      dialogVisible: false
    }
  },
  computed: {
    lang: {
      get() {
        return this.$store.state.app.language
      },
      set(lang) {
        this.$i18n.locale = lang
        this.$store.dispatch('setLanguage', lang)
      }
    }
  },
  created() {
    if (!this.$i18n.getLocaleMessage('en')[viewName]) {
      this.$i18n.mergeLocaleMessage('en', local.en)
      this.$i18n.mergeLocaleMessage('zh', local.zh)
      this.$i18n.mergeLocaleMessage('es', local.es)
    }
    this.loadTableData()
  },
  methods: {
    handleClose(done) {
      this.$emit('update:visible', false)
    },
    loadTableData() {
      const param = {
        'id': this.id
      }
      return new Promise((resolve, reject) => {
        join(JSON.stringify(param)).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('加入活动失败!')
          }
          if (response.data.code === 200) {
            console.log(JSON.stringify(response.data.tableData))
            this.tableData = response.data.tableData
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}
</script>
