<template>
  <div class="app-container">
    <el-form ref="ruleForm2" :model="ruleForm2" :rules="rules2" status-icon label-width="140px" class="demo-ruleForm">
      <el-form-item :label="$t('i18nView.password')" prop="password">
      <el-input v-model="ruleForm2.password" :placeholder="$t('tip.password')" type="password" autocomplete="off"/></el-form-item>
      <el-form-item :label="$t('i18nView.confirmpassword')" prop="checkPass">
        <el-input v-model="ruleForm2.checkPass" :placeholder="$t('tip.confirmpassword')" type="password" autocomplete="off"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm2')">{{ $t('i18nView.submit') }}</el-button>
        <el-button @click="resetForm('ruleForm2')">{{ $t('i18nView.reset') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { update } from '@/api/userMethod'
import local from '@/views/i18n-demo/local'
const viewName = 'i18nView'
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm2.checkPass !== '') {
          this.$refs.ruleForm2.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm2.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleForm2: {
        password: '',
        checkPass: ''
      },
      rules2: {
        password: [
          { required: true, validator: validatePass, trigger: 'blur' },
          { min: 6, message: '密码最少 6 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' },
          { min: 6, message: '密码最少 6 个字符', trigger: 'blur' }
        ]
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
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          return new Promise((resolve, reject) => {
            update(this.ruleForm2).then(response => {
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
    }
  }
}
</script>
