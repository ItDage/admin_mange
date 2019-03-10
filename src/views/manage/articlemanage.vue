<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formInline" class="demo-form-inline" style="width: 100%">
        <el-form-item :label="$t('i18nView.title2')">
          <el-input v-model="formInline.title" :placeholder="$t('tip.title2')" clearable/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.author')">
          <el-input v-model="formInline.author" :placeholder="$t('tip.author')" clearable/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.publishDate')">
          <el-date-picker
            v-model="formInline.publishDate"
            :picker-options="pickerOptions1"
            :placeholder="$t('tip.date')"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            align="right"
            type="date"/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.type')">
          <el-select v-model="formInline.type" :placeholder="$t('tip.type')" filterable clearable>
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
          <el-button type="success" @click="showForm('addArticle')">{{ $t('i18nView.add') }}</el-button>
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
        :label="$t('i18nView.title2')"
        prop="title"
        width="150px"/>
      <el-table-column
        :label="$t('i18nView.content')"
        prop="subContent">
        <!--<template slot-scope="scope">-->
        <!--<div v-model="scope.row.subContent"> {{ scope.row.subContent }} </div>-->
        <!--</template>-->
      </el-table-column>
      <el-table-column
        :label="$t('i18nView.author')"
        prop="author"
        align="center"/>
      <el-table-column
        :label="$t('i18nView.publishDate')"
        align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span style="margin-left: 10px">{{ scope.row.publishDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('i18nView.type')"
        prop="typeName"
        filter-placement="bottom-end"
        align="center">
        <template slot-scope="scope">
          <el-tag
            :type="transferTag(scope)"
            disable-transitions>{{ scope.row.typeName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('i18nView.operate')" align="center">
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
    <addArticle v-if="addArticleVisible" ref="addArticle" :visible.sync="addArticleVisible" :title.sync="title" :operator.sync="opr" :article.sync="article" @closeMain="parentFn" />
  </div>
</template>

<script>

import addArticle from './addArticle'
import { getArticle, delArticle } from '@/api/article'
import local from '@/views/i18n-demo/local'
import { mapGetters } from 'vuex'
const viewName = 'i18nView'
export default {
  components: { addArticle },
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        author: 'doctor',
        address: '上海市普陀区金沙江路 1518 弄',
        tag: '家'
      }],
      options: [],
      formInline: {
        title: '',
        author: '',
        type: null,
        publishDate: null
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
      dialogFormVisible: false,
      currentPage: 1,
      value2: '',
      totalSize: 0,
      pageSize: 10,
      title: '新增文章',
      tableRefresh: false,
      opr: 'add',
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
    },
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    if (!this.$i18n.getLocaleMessage('en')[viewName]) {
      this.$i18n.mergeLocaleMessage('en', local.en)
      this.$i18n.mergeLocaleMessage('zh', local.zh)
      this.$i18n.mergeLocaleMessage('es', local.es)
    }
    // 超管和社团管理员发布的文章类型不同
    if (this.roles.includes('admin')) {
      this.options = [{
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
      }]
    } else {
      this.options = [{
        value: '1100',
        label: '公告'
      }, {
        value: '1101',
        label: '新闻'
      }, {
        value: '1102',
        label: '活动'
      }, {
        value: '1103',
        label: '章程'
      }]
    }
    this.loadTableData(this.currentPage, this.pageSize)
  },
  methods: {
    handleEdit(index, row, refForm) {
      this.addArticleVisible = true
      this.article.id = row.id
      this.article.title = row.title
      this.article.author = row.author
      this.article.content = row.content
      this.article.type = row.type
      this.opr = 'edit'
      this.title = '编辑文章'
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
          delArticle(JSON.stringify(param)).then(response => {
            if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
              reject('删除文章失败!')
            }
            if (response.data.code === 200) {
              this.loadTableData(this.currentPage, this.pageSize, this.formInline.title, this.formInline.author, this.formInline.publishDate, this.formInline.type)
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
      this.loadTableData(this.currentPage, this.pageSize, this.formInline.title, this.formInline.author, this.formInline.publishDate, this.formInline.type)
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
    loadTableData(currentPage, size, title, author, publishDate, type) {
      const param = {
        'currentPage': currentPage,
        'pageSize': size,
        'title': title,
        'author': author,
        'publishDate': publishDate,
        'type': type
      }
      return new Promise((resolve, reject) => {
        getArticle(JSON.stringify(param)).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取文章列表失败!')
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
    }
  }
}
</script>
