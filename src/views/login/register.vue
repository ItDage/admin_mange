<template>
  <el-dialog
    :title.sync="title"
    :visible.sync="visible"
    :before-close="refreshTab"
    center
    append-to-body
    @opened="resetForm('registerForm')">
    <el-form ref="registerForm" :model="registerForm" :rules="rules" label-width="100px" class="demo-ruleForm">
      <el-form-item :label="$t('i18nView.username')" prop="username">
        <el-input v-model="registerForm.username" :placeholder="$t('tip.username')"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.email')" prop="email">
        <el-col :span="20">
          <el-input v-model="registerForm.email" :placeholder="$t('tip.email')"/>
        </el-col>
        <el-col :span="4">
          <el-button :disabled="isSend" type="primary" @click.prevent="sendValidCode('registerForm')">{{
          $t('i18nView.send') }}
          </el-button>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('i18nView.password')" prop="password">
        <el-input
          v-model="registerForm.password"
          :placeholder="$t('tip.password')"
          type="password"
          autocomplete="off"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.confirmpassword')" prop="checkPass">
        <el-input
          v-model="registerForm.checkPass"
          :placeholder="$t('tip.confirmpassword')"
          type="password"
          autocomplete="off"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.school')" prop="school">
        <el-input v-model="registerForm.school" :placeholder="$t('tip.school')"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.gender')" prop="gender">
        <el-select v-model="registerForm.gender" :placeholder="$t('tip.gender')">
          <el-option label="男" value="1"/>
          <el-option label="女" value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('i18nView.birth')" prop="birth">
        <el-col :span="7">
          <el-date-picker
            v-model="registerForm.birth"
            :placeholder="$t('tip.birth')"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            type="date"
            style="width: 94%;"/>
        </el-col>
        <el-col :span="2" class="line"/>
        <el-col :span="11"/>
      </el-form-item>
      <el-form-item :label="$t('i18nView.type')" prop="commonType">
        <el-select v-model="registerForm.commonType" :placeholder="$t('tip.type')">
          <el-option label="社团管理员" value="2"/>
          <el-option label="普通用户" value="3"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('i18nView.validCode')" prop="validCode">
        <el-input v-model="registerForm.validCode" :placeholder="$t('tip.validCode')"/>
      </el-form-item>
      <el-form-item>
        <el-button @click="resetForm('registerForm')">{{ $t('i18nView.reset') }}</el-button>
        <el-button type="primary" @click="submitForm('registerForm')">{{ $t('i18nView.submit') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'
import { sendValidCode, register } from '@/api/userMethod'
import local from '@/views/i18n-demo/local'
const viewName = 'i18nView'
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  components: { LangSelect, SocialSign },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '注册'
    }
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.registerForm.checkPass !== '') {
          this.$refs.registerForm.validateField('checkPass')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        gender: '',
        birth: '',
        email: '',
        school: '',
        validCode: '',
        password: '',
        checkPass: '',
        commonType: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        school: [
          { required: true, message: '请输入学校名称', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        commonType: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        validCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 4, message: '长度 4 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' },
          { min: 6, message: '长度 6 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
        birth: [
          { required: true, message: '请输入出生日期', trigger: 'change' }
        ]
      },
      passwordType: 'password',
      loading: false,
      redirect: undefined,
      isSend: false
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
      },
      ...mapGetters([
        'roles'
      ])
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }

  },
  created() {
    if (!this.$i18n.getLocaleMessage('en')[viewName]) {
      this.$i18n.mergeLocaleMessage('en', local.en)
      this.$i18n.mergeLocaleMessage('zh', local.zh)
      this.$i18n.mergeLocaleMessage('es', local.es)
    }
  },
  methods: {
    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    },
    submitForm: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          return new Promise((resolve, reject) => {
            register(JSON.stringify(this.registerForm)).then(response => {
              if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                reject('注册失败!')
              }
              if (response.data.code === 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.refreshTab()
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
    refreshTab() {
      // 关闭弹窗，触发父组件修改visible值
      this.$emit('update:visible', false)
      this.$emit('closeMain', true)
    },
    sendValidCode(formName) {
      this.$refs.registerForm.validateField('email', (valid) => {
        if (!valid) {
          this.isSend = true
          const param = {
            'email': this.registerForm.email,
            'type': '1'
          }
          return new Promise((resolve, reject) => {
            sendValidCode(JSON.stringify(param)).then(response => {
              if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                reject('发送验证码失败!')
                this.isSend = false
              }
              if (response.data.code === 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
              } else {
                this.$message.error(response.data.message)
              }
              this.isSend = false
            }).catch(error => {
              reject(error)
            })
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg:#283443;
  $light_gray:#eee;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input{
      color: $cursor;
      &::first-line {
        color: $light_gray;
      }
    }
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;
        &:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }
    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg:#2d3a4b;
  $dark_gray:#889aa4;
  $light_gray:#eee;

  .login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
    .login-form {
      position: absolute;
      left: 0;
      right: 0;
      width: 520px;
      max-width: 100%;
      padding: 35px 35px 15px 35px;
      margin: 120px auto;
    }
    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;
      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }
    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }
    .title-container {
      position: relative;
      .title {
        font-size: 26px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
      .set-language {
        color: #fff;
        position: absolute;
        top: 5px;
        right: 0px;
      }
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
    .thirdparty-button {
      position: absolute;
      right: 35px;
      bottom: 28px;
    }
  }
</style>
