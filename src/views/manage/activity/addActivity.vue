<template>
  <!-- 新增文章-->
  <el-dialog :visible.sync="visible" :title.sync="title" :article.sync="activity" :operator.sync="operator" :before-close="refreshTab" center @opened="resetForm('form')">
    <el-form ref="form" :model="form" :rules="rules" class="demo-ruleForm">
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.activityName')" prop="name">
        <el-input v-model="form.name" :placeholder="$t('tip.activityName')" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.activityDate')" prop="activityDate">
        <!--<el-input v-model="form.activityDate" :placeholder="$t('tip.date')" autocomplete="off"/>-->
        <el-date-picker
          v-model="form.activityDate"
          :placeholder="$t('tip.date')"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.activityAddress')" prop="address">
        <el-input v-model="form.address" :placeholder="$t('tip.activityAddress')" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.content')" prop="content">
        <el-input v-model="form.content" :placeholder="$t('tip.content')" type="textarea"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.contact')" prop="contact">
        <el-input v-model="form.contact" :placeholder="$t('tip.contact')" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.needs')" prop="needs">
        <el-input v-model="form.needs" :placeholder="$t('tip.needs')" type="number" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.description')" prop="description">
        <el-input v-model="form.description" :placeholder="$t('tip.description')" type="textarea" autocomplete="off"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <!--<el-button @click="visible = false">取 消</el-button>-->
      <el-button @click="resetForm('form')">{{ $t('i18nView.reset') }}</el-button>
      <el-button type="primary" plain @click="submitForm('form')">{{ $t('i18nView.submit') }}</el-button>
    </div>
    <!--<span>{{ printArticle }}</span>-->
  </el-dialog>
</template>
<script>
import TinymceDemo from '@/components/Tinymce'
import { add } from '@/api/activity'
import local from '@/views/i18n-demo/local'
import { mapGetters } from 'vuex'

const viewName = 'i18nView'
export default {
  components: { TinymceDemo },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '无标题'
    },
    article: {
      type: Object,
      default: null
    },
    operator: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      form: {
        name: null,
        activityDate: null,
        address: null,
        content: null,
        description: null,
        contact: null,
        needs: null
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        activityDate: [
          { required: true, message: '请输入活动时间', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入活动地址', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入备注', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系人', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        needs: [
          { required: true, message: '请输入人数', trigger: 'blur' }
        ]
      },
      formLabelWidth: '120px',
      articleContent: '',
      addArticleVisible: true,
      opr: 'add'
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
  watch: {
  },
  created() {
    if (!this.$i18n.getLocaleMessage('en')[viewName]) {
      this.$i18n.mergeLocaleMessage('en', local.en)
      this.$i18n.mergeLocaleMessage('zh', local.zh)
      this.$i18n.mergeLocaleMessage('es', local.es)
    }
  },
  mounted() {
    this.opr = this.operator
    if (this.opr === 'edit') {
      // 编辑--1
      this.form = this.article
      this.form.commonType = 1
    } else {
      // 新增--2
      this.form.commonType = 2
    }
  },
  methods: {
    refreshTab() {
      // 关闭弹窗，触发父组件修改visible值
      this.$emit('update:visible', false)
      this.$emit('closeMain', true)
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          return new Promise((resolve, reject) => {
            console.log(JSON.stringify(this.form))
            add(JSON.stringify(this.form)).then(response => {
              if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                reject('新增文章失败!')
              }
              if (response.data.code === 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.$emit('update:visible', false)
                // 刷新列表
                this.$emit('closeMain', true)
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
    }
  }
}
</script>
