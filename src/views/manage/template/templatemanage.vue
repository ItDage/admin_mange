<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formInline" class="demo-form-inline" style="width: 100%">
        <el-form-item label="文件名">
          <el-input v-model="formInline.name" placeholder="文件名" clearable/>
        </el-form-item>
        <el-form-item label="上传者">
          <el-input v-model="formInline.uploadUser" placeholder="上传者" clearable/>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="formInline.uploadDate"
            :picker-options="pickerOptions1"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            align="right"
            type="date"
            placeholder="选择日期"/>
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select v-model="formInline.type" filterable placeholder="模板类型" clearable>
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">{{ $t('i18nView.find') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="uploadFileForm('addArticle')">{{ $t('i18nView.add') }}</el-button>
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
        align="center"/>
      <el-table-column
        prop="name"
        label="文件名"/>
      <el-table-column
        prop="uploadUser"
        label="上传者"
        align="center"/>
      <el-table-column
        label="日期"
        align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span style="margin-left: 10px">{{ scope.row.uploadDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :filters="[{ text: '认证模板', value: '认证模板' }, { text: '必填模板', value: '必填模板' }, { text: '其他模板', value: '其他模板' }]"
        :filter-method="filterTag"
        prop="typeName"
        label="类型"
        filter-placement="bottom-end"
        align="center">
        <template slot-scope="scope">
          <el-tag
            :type="transferTag(scope)"
            disable-transitions>{{ scope.row.typeName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">{{ $t('i18nView.download') }}</el-button>
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
    <!--<addArticle v-if="addArticleVisible" ref="addArticle" :visible.sync="addArticleVisible" :title.sync="title" :operator.sync="opr" :article.sync="article" @closeMain="parentFn" />-->
    <uploadFile v-if="uploadFileVisible" ref="uploadFile" :visible.sync="uploadFileVisible" :show-input.sync="showInput" @closeMain="parentFn" />
  </div>
</template>

<script>

// import addArticle from '../addArticle'
import uploadFile from './uploadFile'
import { getFileList, delFile, download } from '@/api/qiniu'
import local from '@/views/i18n-demo/local'
import { parseTime } from '@/utils'
const viewName = 'i18nView'
export default {
  components: { uploadFile },
  data() {
    return {
      tableData: [],
      options: [{
        value: '2000',
        label: '认证模板'
      }, {
        value: '2001',
        label: '必填模板'
      }, {
        value: '2002',
        label: '其他模板'
      }],
      formInline: {
        name: '',
        uploadUser: '',
        type: null,
        uploadDate: null
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
      addArticleVisible: false,
      uploadFileVisible: false,
      dialogFormVisible: false,
      currentPage: 1,
      totalSize: 0,
      pageSize: 10,
      title: '新增文章',
      opr: 'add',
      showInput: true,
      downloadLoading: false,
      article: {
        id: 1,
        title: null,
        author: null,
        content: null,
        type: 1000
      }
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
    this.loadTableData(this.currentPage, this.pageSize)
  },
  methods: {
    handleEdit(index, row) {
      const param = {
        'id': row.id
      }
      return new Promise((resolve, reject) => {
        download(param).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('下载文件失败!')
          }
          if (response.data.code === 200) {
            window.open(response.data.data)
            // window.location.href = response.data.data
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    handleDelete(index, id) {
      const param = {
        'id': id
      }
      this.$confirm('此操作将永久删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return new Promise((resolve, reject) => {
          delFile(param).then(response => {
            if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
              reject('删除文件失败!')
            }
            if (response.data.code === 200) {
              this.loadTableData(this.currentPage, this.pageSize, this.formInline.name, this.formInline.uploadUser, this.formInline.uploadDate, this.formInline.type)
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
      this.loadTableData(this.currentPage, this.pageSize, this.formInline.name, this.formInline.uploadUser, this.formInline.uploadDate, this.formInline.type)
    },
    filterTag(value, row) {
      return row.typeName === value
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadTableData(this.currentPage, val, this.formInline.title, this.formInline.author, this.formInline.publishDate, this.formInline.type)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadTableData(val, this.pageSize, this.formInline.title, this.formInline.author, this.formInline.publishDate, this.formInline.type)
    },
    showForm(refForm) {
      this.addArticleVisible = true
      this.opr = 'add'
    },
    uploadFileForm() {
      this.uploadFileVisible = true
      this.opr = 'add'
    },
    loadTableData(currentPage, size, name, upload_user, upload_date, type) {
      const param = {
        'currentPage': currentPage,
        'pageSize': size,
        'name': name,
        'uploadUser': upload_user,
        'uploadDate': upload_date,
        'type': type
      }
      return new Promise((resolve, reject) => {
        getFileList(param).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取文件列表失败!')
          }
          if (response.data.code === 200) {
            this.tableData = response.data.tableData
            // alert(JSON.stringify(this.tableData))
            this.totalSize = response.data.total
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    refreshTab() {
      this.loadTableData(this.currentPage, this.pageSize, this.formInline.title, this.formInline.author, this.formInline.publishDate, this.formInline.type)
    },
    transferTag(scope) {
      var color = ''
      switch (scope.row.typeName) {
        case '认证模板' :
          color = 'primary'
          break
        case '必填模板':
          color = 'success'
          break
        case '其他模板':
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
        const tHeader = ['文件名', '上传者', '日期', '类型']
        const filterVal = ['name', 'uploadUser', 'uploadDate', 'typeName']
        const list = this.tableData
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '上传模板Excel',
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
    }
  }
}
</script>
