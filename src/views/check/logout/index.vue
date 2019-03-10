<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formInline" class="demo-form-inline" style="width: 100%">
        <el-form-item :label="$t('i18nView.corporation')">
          <el-input v-model="formInline.corporation" :placeholder="$t('tip.corporation')" clearable/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.createDate')">
          <el-date-picker
            v-model="formInline.createDate"
            :picker-options="pickerOptions1"
            :placeholder="$t('tip.date')"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            align="right"
            type="date"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="findByParam">{{ $t('i18nView.find') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button :loading="downloadLoading" type="info" icon="document" @click="handleDownload">{{ $t('excel.export') }} Excel</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%">
      <el-table-column
        type="index"
        align="center"
        width="65"/>
      <el-table-column
        :label="$t('i18nView.corporation')"
        prop="corporation"
        width="150px"/>
      <el-table-column
        :label="$t('i18nView.corporationDesc')"
        prop="corporationDesc"/>
      <el-table-column
        :label="$t('i18nView.createDate')"
        prop="createDate"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.admin')"
        prop="admin"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.admin') + $t('i18nView.phone')"
        prop="phone"
        align="center"/>
      <el-table-column :label="$t('i18nView.operate')" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="logout(scope.row)">{{ $t('i18nView.logOutCorporation') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="block">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20]"
        :total="totalSize"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange2"
        @current-change="handleCurrentChange"/>
    </div>
    <LogoutCorpApplication v-if="dialogFormVisible" ref="LogoutCorpApplication" :visible.sync="dialogFormVisible" :corporation.sync="currentCorporation" :email.sync="currentEmail"/>
  </div>
</template>
<script>
import uploadFile from '@/views/manage/template/uploadFile'
import { getToken, upload } from '@/api/qiniu'
import { loadMyCorporation } from '@/api/checkup'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'
import LogoutCorpApplication from '@/views/check/logout/logoutCorpApplication'

import local from '@/views/i18n-demo/local'
const viewName = 'i18nView'

export default {
  components: { uploadFile, LogoutCorpApplication },
  data() {
    return {
      tableData: [],
      formInline: {
        corporation: null,
        createDate: null
      },
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      currentPage: 1,
      totalSize: 0,
      pageSize: 10,
      downloadLoading: false,
      dialogFormVisible: false,
      currentCorporation: null,
      currentEmail: this.$store.state.user.email
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
    },
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    if (!this.$i18n.getLocaleMessage('en')[viewName]) {
      this.$i18n.mergeLocaleMessage('en', local.en)
      this.$i18n.mergeLocaleMessage('zh', local.zh)
    }
    this.loadTableData()
  },
  methods: {
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    logout(row) {
      this.dialogFormVisible = true
      this.currentCorporation = row.corporation
    },
    loadTableData() {
      const param = {
        'corporation': this.formInline.corporation,
        'createDate': this.formInline.createDate,
        'currentPage': this.currentPage,
        'pageSize': this.pageSize
      }
      return new Promise((resolve, reject) => {
        loadMyCorporation(param).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取社团列表失败!')
          }
          if (response.data.code === 200) {
            this.tableData = response.data.tableData
            this.totalSize = response.data.total
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    findByParam() {
      this.currentPage = 1
      this.pageSize = 10
      this.loadTableData()
    },
    handleSizeChange2(val) {
      this.pageSize = val
      this.loadTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadTableData()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['社团名称', '社团描述', '申请时间', '管理员', '管理员手机号']
        const filterVal = ['corporation', 'corporationDesc', 'createDate', 'admin', 'phone']
        const list = this.tableData
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '我的社团',
          autoWidth: true,
          bookType: 'xlsx'
        })
        this.downloadLoading = false
      })
    },
    beforeUpload(file) {
      const _self = this
      return new Promise((resolve, reject) => {
        getToken().then(response => {
          const key = response.data.data.qiniu_key + file.name
          const token = response.data.data.qiniu_token
          _self._data.dataObj.token = token
          _self._data.dataObj.key = key
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(false)
        })
      })
    },
    uploadSuccess(response, file, fileList) {
      const id = response.key
      const name = file.name
      const secondType = this.ruleForm.school
      return new Promise((resolve, reject) => {
        upload(id, name, this.type, secondType).then(response => {
          const code = response.data.code
          if (code === 200) {
            this.$notify({
              title: response.data.message,
              message: name + response.data.message,
              type: 'success'
            })
          } else {
            this.$notify.error({
              title: response.data.message,
              message: name + response.data.message
            })
          }
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(false)
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
