<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="formInline" class="demo-form-inline" style="width: 100%">
        <el-form-item label="申请邮箱">
          <el-input v-model="formInline.creater" placeholder="申请邮箱" clearable/>
        </el-form-item>
        <!--<el-form-item label="证件号码">-->
          <!--<el-input v-model="formInline.identification" placeholder="身份证号码" clearable/>-->
        <!--</el-form-item>-->
        <el-form-item label="手机号">
          <el-input v-model="formInline.phone" placeholder="手机号" clearable/>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="formInline.createDate"
            :picker-options="pickerOptions1"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            align="right"
            type="date"
            placeholder="选择日期"/>
        </el-form-item>
        <el-form-item label="是否通过">
          <el-select v-model="formInline.ispass" filterable placeholder="是否通过" clearable>
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="申请人">
              <span>{{ props.row.user.username }}</span>
            </el-form-item>
            <el-form-item label="身份证号">
              <span>{{ props.row.identification }}</span>
            </el-form-item>
            <el-form-item label="手机号">
              <span>{{ props.row.phone }}</span>
            </el-form-item>
            <el-form-item label="备注">
              <span>{{ props.row.description }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        type="index"
        align="center"
        width="65"/>
      <el-table-column
        prop="school"
        label="学校"
        width="150px"/>
      <el-table-column
        prop="creater"
        label="邮箱"
        width="120"/>
      <el-table-column
        prop="corporation"
        label="申请社团"
        align="center"
        width="160"/>
      <el-table-column
        prop="corporationDesc"
        label="社团描述"
        align="center"
        width="160"/>
      <el-table-column
        label="申请时间"
        align="center"
        width="120">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span style="margin-left: 10px">{{ scope.row.createDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="ispass"
        label="是否通过"
        align="center"
        width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.ispass"
            active-text="是"
            active-value="01"
            inactive-text="否"
            inactive-value="00"
            @change="updatePassStatus($event, scope.row.id, scope.row.creater)"/>
        </template>
      </el-table-column>
      <el-table-column
        prop="fileEntityList.name"
        label="审核文件"
        align="center"
        width="100">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click.native.prevent="loadFileList(scope.$index, scope.row.fileEntityList)">
            查看文件
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">下载</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row.id)">删除</el-button>
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

    <el-dialog :visible.sync="dialogTableVisible" title="文件列表">
      <el-table :data="fileData">
        <el-table-column
          type="index"
          align="center"
          width="150"/>
        <el-table-column property="name" label="文件名" width="200"/>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="downloadFile(scope.$index, scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>

import { getAll, update, del } from '@/api/checkup'
import { download } from '@/api/qiniu'
export default {
  // components: { addArticle, uploadFile },
  data() {
    return {
      tableData: [],
      options: [{
        value: '00',
        label: '未通过'
      }, {
        value: '01',
        label: '已通过'
      }],
      formInline: {
        school: '',
        creater: '',
        phone: '',
        identification: '',
        ispass: null,
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
      addArticleVisible: false,
      uploadFileVisible: false,
      dialogTableVisible: false,
      currentPage: 1,
      totalSize: 0,
      pageSize: 10,
      title: '新增文章',
      opr: 'add',
      fileData: null,
      article: {
        id: 1,
        title: null,
        author: null,
        content: null,
        type: 1000
      }
    }
  },
  created() {
    // this.$refs.formInline.resetFields()
    this.loadTableData(this.currentPage, this.pageSize)
  },
  methods: {
    handleEdit(index, row) {
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
          del(param).then(response => {
            if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
              reject('删除审核失败!')
            }
            if (response.data.code === 200) {
              this.loadTableData(this.currentPage, this.pageSize, this.formInline.creater, this.formInline.identification, this.formInline.phone, this.formInline.createDate, this.formInline.ispass)
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
      this.loadTableData(this.currentPage, this.pageSize, this.formInline.creater, this.formInline.identification, this.formInline.phone, this.formInline.createDate, this.formInline.ispass)
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
    loadTableData(currentPage, size, creater, identification, phone, create_date, ispass) {
      const param = {
        'currentPage': currentPage,
        'pageSize': size,
        'creater': creater,
        'identification': identification,
        'phone': phone,
        'createDate': create_date,
        'ispass': ispass
      }
      return new Promise((resolve, reject) => {
        getAll(param).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取文件列表失败!')
          }
          if (response.data.code === 200) {
            this.tableData = response.data.tableData
            console.log(JSON.stringify(this.tableData))
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
    updatePassStatus(nval, id, creater) {
      const param = {
        'id': id,
        'ispass': nval,
        'creater': creater
      }
      return new Promise((resolve, reject) => {
        update(param).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('更新状态失败!')
          }
          if (response.data.code === 200) {
            this.$notify({
              title: '更新状态成功',
              message: '更新用户验证情况成功!',
              type: 'success'
            })
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    loadFileList(index, data) {
      this.dialogTableVisible = true
      this.fileData = data
    },
    downloadFile(index, row) {
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
    }
  }
}
</script>
<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>

