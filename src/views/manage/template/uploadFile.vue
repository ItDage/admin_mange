<template>
  <el-dialog
    :visible.sync="visible"
    :before-close="refreshTab"
    :show-input="showInput"
    center
    width="30%"
    @opened="resetForm('form')">
    <el-form v-if="isShowInput" ref="form" :model="form" label-width="80px">
      <el-form-item label="模板类型">
        <el-select v-model="form.type" filterable placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-upload
        :data="dataObj"
        :before-upload="beforeUpload"
        :on-success="uploadSuccess"
        :on-remove="del"
        :multiple="true"
        action="//upload.qiniu.com"
        drag>
        <i class="el-icon-upload"/>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </el-form>
  </el-dialog>
</template>
<script>
import { getToken, upload } from '@/api/qiniu' // 获取七牛token 后端通过Access Key,Secret Key,bucket等生成token
import { delFile } from '@/api/qiniu'
// 七牛官方sdk https://developer.qiniu.com/sdk#official-sdk
export default{
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    oprType: {
      type: String,
      default: '1'
    },
    showInput: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dataObj: { token: '', key: '' },
      image_uri: [],
      fileList: [],
      fileType: '1',
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
      form: {
        type: '2002'
      },
      isShowInput: false
    }
  },
  mounted() {
    this.isShowInput = this.showInput
  },
  methods: {
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
      return new Promise((resolve, reject) => {
        upload(id, name, this.form.type).then(response => {
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
    del(file, fileList) {
      const param = {
        'id': file.response.key
      }
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
    },
    refreshTab() {
      // 关闭弹窗，触发父组件修改visible值
      this.$emit('update:visible', false)
      this.$emit('closeMain', true)
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
