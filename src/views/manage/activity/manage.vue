<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formInline" class="demo-form-inline" style="width: 100%">
        <el-form-item :label="$t('i18nView.activityName')">
          <el-input v-model="formInline.name" :placeholder="$t('tip.activityName')" clearable/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.activityDate')">
          <el-date-picker
            v-model="formInline.activityDate"
            :placeholder="$t('tip.date')"
            type="date"
            value-format="yyyy-MM-dd"/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.createDate')">
          <el-date-picker
            v-model="formInline.createDate"
            :placeholder="$t('tip.date')"
            type="date"
            value-format="yyyy-MM-dd"/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.activityAddress')">
          <el-input v-model="formInline.address" :placeholder="$t('tip.activityAddress')" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ $t('i18nView.find') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="showForm('addArticle')">{{ $t('i18nView.add') }}</el-button>
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
        :label="$t('i18nView.activityName')"
        prop="name"
        width="120px"/>
      <el-table-column
        :label="$t('i18nView.activityDate')"
        width="170px"
        prop="activityDate"/>
      <el-table-column
        :label="$t('i18nView.activityAddress')"
        prop="address"
        width="120px"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.content')"
        prop="content"
        width="150px"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.contact')"
        prop="contact"
        width="100px"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.needs')"
        prop="needs"
        width="50px"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.description')"
        prop="description"
        width="150px"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.createDate')"
        prop="createDate"
        width="170px"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.join')"
        width="80px"
        align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleClick(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('i18nView.operate')" width="150px" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row, 'addArticle')">{{ $t('i18nView.edit') }}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row.id)">{{ $t('i18nView.delete') }}</el-button>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"/>
    </div>
    <addArticle v-if="addArticleVisible" ref="addArticle" :visible.sync="addArticleVisible" :title.sync="title" :operator.sync="opr" :article.sync="activity" @closeMain="parentFn" />
    <joiner v-if="dialogVisible" ref="joiner" :visible.sync="dialogVisible" :id.sync="id"/>
  </div>
</template>

<script>

import addArticle from './addActivity'
import { getAllActivityByParam, delActivity } from '@/api/activity'
import local from '@/views/i18n-demo/local'
import { parseTime } from '@/utils'
import joiner from '@/views/usercenter/myCorporation/joiner'
const viewName = 'i18nView'
export default {
  components: { addArticle, joiner },
  data() {
    return {
      tableData: [],
      options: [{
        value: '1000',
        label: '公告'
      }, {
        value: '1001',
        label: '新闻'
      }, {
        value: '1002',
        label: '法律法规'
      }, {
        value: '1003',
        label: '其他'
      }],
      formInline: {
        name: null,
        activityDate: null,
        createDate: null,
        address: null
      },
      addArticleVisible: false,
      currentPage: 1,
      totalSize: 0,
      pageSize: 10,
      title: '新增活动',
      tableRefresh: false,
      downloadLoading: false,
      opr: 'add',
      activity: {
        id: 0,
        name: null,
        activityDate: null,
        address: null,
        content: null,
        contact: null,
        nedds: null,
        description: null
      },
      id: 0,
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
    handleEdit(index, row, refForm) {
      this.addArticleVisible = true
      this.activity.id = row.id
      this.activity.name = row.name
      this.activity.activityDate = row.activityDate
      this.activity.address = row.address
      this.activity.content = row.content
      this.activity.contact = row.contact
      this.activity.needs = row.needs
      this.activity.description = row.description
      this.opr = 'edit'
      this.title = '编辑活动'
    },
    handleDelete(index, id) {
      const param = {
        'id': id
      }
      this.$confirm('此操作将永久删除该活动, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return new Promise((resolve, reject) => {
          delActivity(param).then(response => {
            if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
              reject('删除活动失败!')
            }
            if (response.data.code === 200) {
              this.loadTableData()
              this.$message({
                type: 'success',
                message: response.data.message
              })
            } else {
              this.$message.error(response.data.message)
            }
          }).catch(error => {
            reject(error)
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    onSubmit() {
      this.currentPage = 1
      this.pageSize = 10
      this.loadTableData()
    },
    filterTag(value, row) {
      return row.typeName === value
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadTableData()
    },
    showForm(refForm) {
      this.addArticleVisible = true
      this.opr = 'add'
    },
    loadTableData() {
      const param = {
        'currentPage': this.currentPage,
        'pageSize': this.pageSize,
        'name': this.formInline.name,
        'activityDate': this.formInline.activityDate,
        'createDate': this.formInline.createDate,
        'address': this.formInline.address
      }
      return new Promise((resolve, reject) => {
        getAllActivityByParam(JSON.stringify(param)).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取活动列表失败!')
          }
          if (response.data.code === 200) {
            this.tableData = response.data.tableData
            this.totalSize = response.data.total
            // console.log(JSON.stringify(this.tableData))
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    refreshTab() {
      this.loadTableData()
    },
    transferTag(scope) {
      var color = ''
      switch (scope.row.typeName) {
        case '公告' :
          color = 'primary'
          break
        case '新闻':
          color = 'success'
          break
        case '法律法规':
          color = 'warning'
          break
        default:
          color = 'danger'
      }
      return color
    },
    parentFn(data) {
      if (data) {
        this.refreshTab()
      }
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['活动名称', '活动时间', '活动地址', '内容', '联系人', '人数', '备注']
        const filterVal = ['name', 'activityDate', 'address', 'content', 'contact', 'needs', 'description']
        const list = this.tableData
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '活动列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
        this.downloadLoading = false
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
    },
    handleClick(row) {
      this.id = row.id
      this.dialogVisible = true
    }
  }
}
</script>
