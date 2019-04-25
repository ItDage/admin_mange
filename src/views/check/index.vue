<template>
  <div class="app-container">
    <code>
      <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
    </code>
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm">
      <el-form-item :label="$t('i18nView.school')" prop="school">
        <el-input v-model="ruleForm.school" :placeholder="$t('tip.school')" :disabled="true"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.identification')" prop="identification">
        <el-input v-model="ruleForm.identification" :placeholder="$t('tip.identification')"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.phone')" prop="phone">
        <el-input v-model="ruleForm.phone" :placeholder="$t('tip.phone')"/>
      </el-form-item>
      <span v-if="roles.includes('corporation_admin') || roles.includes('common') ">
        <el-form-item :label="$t('i18nView.corporation')" prop="corporation">
          <el-input v-model="ruleForm.corporation" :placeholder="$t('tip.corporation')"/>
        </el-form-item>
        <el-form-item :label="$t('i18nView.corporationDesc')" prop="corporationDesc">
          <el-input v-model="ruleForm.corporationDesc" :placeholder="$t('tip.corporationDesc')"/>
        </el-form-item>
      </span>
      <span v-if="roles.includes('student') || roles.includes('corporation_common')">
        <el-form-item :label="$t('i18nView.corporation')" prop="corporation">
          <el-select v-model="ruleForm.corporation" filterable placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
      </span>
      <el-form-item :label="$t('i18nView.description')" prop="description">
        <el-input v-model="ruleForm.description" :placeholder="$t('tip.description')" type="textarea"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.checkFile')">
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
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">{{ $t('i18nView.submit') }}</el-button>
        <el-button @click="resetForm('ruleForm')">{{ $t('i18nView.reset') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import uploadFile from '@/views/manage/template/uploadFile'
import { delFile, getToken, upload } from '@/api/qiniu'
import { add, getValidCorBySchool } from '@/api/checkup'
import { validPhone } from '../../utils/validate'
import { getUserInfo } from '@/api/userMethod'
import { mapGetters } from 'vuex'

import local from '@/views/i18n-demo/local'
const viewName = 'i18nView'

export default {
  components: { uploadFile },
  data() {
    return {
      ruleForm: {
        school: '',
        identification: '',
        phone: '',
        description: '',
        corporation: '',
        corporationDesc: ''
      },
      dataObj: { token: '', key: '' },
      activeNames: ['1'],
      type: '2003',
     // fileList: [{ name: 'test', url: 'tet', response: { key: '1' }}],
      rules: {
        school: [
          { required: true, message: '请输入申请学校名称', trigger: 'blur' }
        ],
        identification: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { min: 18, max: 18, message: '长度在 18 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ],
        description: [
          { required: true, message: '请填写备注', trigger: 'blur' }
        ],
        corporation: [
          { required: true, message: '请输入社团名称', trigger: 'blur' }
        ],
        corporationDesc: [
          { required: true, message: '请输入社团描述', trigger: 'blur' }
        ]
      },
      options: [],
      value8: ''
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
    this.loadUserInfo()
    if (this.roles.includes('student') || this.roles.includes('corporation_common')) {
      // 普通用户--查询该用户所在学校有哪些可加入的社团
      this.loadCorpList()
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          return new Promise((resolve, reject) => {
            add(this.ruleForm).then(response => {
              if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                reject('申请失败!')
              }
              if (response.data.code === 200) {
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
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    handleChange(val) {
      console.log(val)
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
    del(file, fileList) {
      // console.log(JSON.stringify(file))
      const param = {
        'id': file.response.key
      }
      return new Promise((resolve, reject) => {
        delFile(param).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('删除文件失败!')
          }
          if (response.data.code === 200) {
            this.$notify({
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
    },
    loadUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取当前用户信息失败!')
          }
          if (response.data.code === 200) {
            this.ruleForm = response.data.data
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    loadCorpList() {
      return new Promise((resolve, reject) => {
        getValidCorBySchool().then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取社团列表信息失败!')
          }
          if (response.data.code === 200) {
            this.options = response.data.corporationList
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
