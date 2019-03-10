<template>
  <div class="app-container">
    <el-form ref="registerForm" :model="registerForm" :rules="rules" label-width="100px" class="demo-ruleForm">
      <el-form-item>
        <el-upload
          :data="dataObj"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :on-success="handleAvatarSuccess"
          class="avatar-uploader"
          action="//upload.qiniu.com">
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"/>
        </el-upload>
      </el-form-item>
      <el-form-item :label="$t('i18nView.username')" prop="username">
        <el-input v-model="registerForm.username" :placeholder="$t('tip.username')"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.gender')" prop="gender">
        <el-select v-model="registerForm.gender" :placeholder="$t('tip.gender')">
          <el-option label="男" value="1"/>
          <el-option label="女" value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('i18nView.birth')" prop="birth">
        <el-col :span="7">
          <el-date-picker v-model="registerForm.birth" :placeholder="$t('tip.birth')" value-format="yyyy-MM-dd" type="date" style="width: 94%;" @change="getSTime"/>
        </el-col>
        <el-col :span="2" class="line"/>
        <el-col :span="11"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.school')" prop="school">
        <el-input v-model="registerForm.school" :placeholder="$t('tip.school')"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.phone')" prop="phone">
        <el-input v-model="registerForm.phone" :placeholder="$t('tip.phone')"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.identification')" prop="identification">
        <el-input v-model="registerForm.identification" :placeholder="$t('tip.identification')"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('registerForm')">{{ $t('i18nView.submit') }}</el-button>
        <el-button @click="resetForm('registerForm')">{{ $t('i18nView.reset') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { update, getUserInfo } from '@/api/userMethod'
import local from '@/views/i18n-demo/local'
import { validPhoneNotRequired } from '../../../utils/validate'
import { getToken, upload } from '@/api/qiniu' // 获取七牛token 后端通过Access Key,Secret Key,bucket等生成token

const viewName = 'i18nView'
export default {
  components: { },
  data() {
    return {
      registerForm: {
        username: '',
        gender: '',
        birth: '',
        school: '',
        phone: '',
        identification: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        school: [
          { required: true, message: '请输入学校', trigger: 'blur' }
        ],
        birth: [
          { required: true, message: '请输入出生日期', trigger: 'change' }
        ],
        phone: [
          { required: false, trigger: 'blur', validator: validPhoneNotRequired }
        ],
        identification: [
          { min: 18, max: 18, message: '长度在 18 个字符', trigger: 'blur' }
        ]
      },
      imageUrl: '',
      dataObj: { token: '', key: '' },
      type: '2004'
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
    this.loadUserInfo()
    this.imageUrl = this.$store.state.user.avatar
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          return new Promise((resolve, reject) => {
            update(this.registerForm).then(response => {
              if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                reject('获取文件列表失败!')
              }
              if (response.data.code === 200) {
                this.$notify({
                  title: '成功',
                  message: response.data.message,
                  type: 'success'
                })
              } else {
                this.$message.error(response.data.message)
              }
            }).catch(error => {
              reject(error)
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    loadUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取用户信息失败!')
          }
          if (response.data.code === 200) {
            this.registerForm = response.data.data
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    getSTime(val) {
      this.registerForm.birth = val
    },
    handleAvatarSuccess(response, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      const id = response.key
      const name = file.name
      const imageUrl = response.key
      new Promise((resolve, reject) => {
        // 更新文件
        upload(id, name, this.type).then(response => {
          const code = response.data.code
          if (code === 200) {
            const param = {
              image: imageUrl
            }
            return new Promise((resolve, reject) => {
              update(param).then(response => {
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
    beforeAvatarUpload(file) {
      const _self = this
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      if (isJPG && isLt2M) {
        const param = {
          isPublic: '1'
        }
        return new Promise((resolve, reject) => {
          getToken(param).then(response => {
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
      } else {
        return false
      }
    }
  }
}
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
