<template>
  <el-dialog :visible.sync="visible" :corporation.sync="corporation" :email.sync="email" :before-close="refreshTab" :title="$t('i18nView.logOutCorporation') + $t('i18nView.application')">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.corporation')" prop="corporation">
        <el-input :disabled="true" v-model="form.corporation" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.email')" prop="email">
        <el-col :span="20">
          <el-input :disabled="true" v-model="form.email" :placeholder="$t('tip.email')"/>
        </el-col>
        <el-col :span="4">
          <el-button :disabled="isSend" type="primary" @click.prevent="sendValidCode('form')">{{ $t('i18nView.send') }}</el-button>
        </el-col>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.logOutCorporation') + $t('i18nView.reason')" prop="reason">
        <el-input v-model="form.reason" :placeholder="$t('tip.reason')" type="textarea"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.validCode')" prop="validCode">
        <el-input v-model="form.validCode" :placeholder="$t('tip.validCode')"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="refreshTab">{{ $t('i18nView.cancel') }}</el-button>
      <el-button type="primary" @click="submit('form')">{{ $t('i18nView.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { sendValidCode } from '@/api/userMethod'
import { application, getReason } from '@/api/checkup'
export default {
  name: 'LogoutCorpApplication',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    corporation: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      form: {
        corporation: null,
        email: null,
        reason: null,
        validCode: null
      },
      formLabelWidth: '120px',
      isSend: false,
      dialogVisible: false,
      rules: {
        corporation: [
          { required: true, message: '请输入社团名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱名称', trigger: 'blur' }
        ],
        validCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 4, message: '长度在 4 个字符', trigger: 'blur' }
        ],
        reason: [
          { required: true, message: '请填写退团原因', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.form.corporation = this.corporation
    this.form.email = this.email
    this.dialogVisible = this.visible
    this.getReason()
  },
  methods: {
    refreshTab() {
    // 关闭弹窗，触发父组件修改visible值
      this.$emit('update:visible', false)
    },
    sendValidCode(formName) {
      this.isSend = true
      return new Promise((resolve, reject) => {
        const param = {
          'email': this.form.email,
          'type': '2'
        }
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
    },
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          console.log(JSON.stringify(this.form))
          return new Promise((resolve, reject) => {
            application(JSON.stringify(this.form)).then(response => {
              if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                reject('申请退团失败!')
                this.isSend = false
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
              this.isSend = false
            }).catch(error => {
              reject(error)
            })
          })
        } else {
          return false
        }
      })
    },
    getReason() {
      return new Promise((resolve, reject) => {
        const param = {
          'corporation': this.form.corporation
        }
        getReason(JSON.stringify(param)).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('获取退团原因失败!')
            this.isSend = false
          }
          if (response.data.code === 200) {
            this.form.reason = response.data.data.reason
          } else {
            this.$message.error(response.data.message)
          }
          this.isSend = false
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}
</script>
