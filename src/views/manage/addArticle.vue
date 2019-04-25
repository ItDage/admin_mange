<template>
  <!-- 新增文章-->
  <el-dialog :visible.sync="visible" :title.sync="title" :article.sync="article" :operator.sync="operator" :before-close="refreshTab" center @opened="resetForm('form')">
    <el-form ref="form" :model="form" :rules="rules" class="demo-ruleForm">
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.title2')" prop="title">
        <el-input v-model="form.title" :placeholder="$t('tip.title2')" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.author')" prop="author">
        <el-input v-model="form.author" :placeholder="$t('tip.author')" autocomplete="off"/>
      </el-form-item>
      <el-form-item :label-width="formLabelWidth" :label="$t('i18nView.type')" prop="type">
        <el-select v-if="roles.includes('admin')" v-model="form.type" :placeholder="$t('tip.type')">
          <el-option :label="$t('i18nView.notice')" value="1000"/>
          <el-option :label="$t('i18nView.news')" value="1001"/>
          <el-option :label="$t('i18nView.legal')" value="1002"/>
          <el-option :label="$t('i18nView.others')" value="1003"/>
        </el-select>
        <el-select v-if="roles.includes('corporation_admin')" v-model="form.type" :placeholder="$t('tip.type')">
          <el-option :label="$t('i18nView.notice')" value="1100"/>
          <el-option :label="$t('i18nView.news')" value="1101"/>
          <el-option :label="$t('i18nView.activity')" value="1102"/>
          <el-option :label="$t('i18nView.chapter')" value="1103"/>
        </el-select>
      </el-form-item>
    </el-form>
    <TinymceDemo ref="content" v-model="articleContent" :height="300"/>
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
import { add } from '@/api/article'
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
      default: 'xx'
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
        id: 0,
        title: '',
        type: '',
        content: '',
        author: '',
        date2: '',
        commonType: 0
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入作者', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择文章类型', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { min: 1, message: '长度在大于1个字符', trigger: 'blur' }
        ],
        date2: [
          { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
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
      this.articleContent = this.article.content
      this.form.commonType = 1
    } else {
      // 新增--2
      this.form.commonType = 2
      console.log('2')
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
        var content = this.articleContent
        if (valid) {
          if (content == null || content.length === 0) {
            this.$message({
              message: '文章内容不能为空',
              type: 'warning'
            })
            return false
          } else {
            var article = this.form
            article['content'] = content
            return new Promise((resolve, reject) => {
              add(JSON.stringify(article)).then(response => {
                if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
                  reject('新增文章失败!')
                }
                if (response.data.code === 200) {
                  this.$message({
                    message: response.data.message,
                    type: 'success'
                  })
                  this.$emit('update:visible', false)
                  this.$emit('closeMain', true)
                } else {
                  this.$message.error(response.data.message)
                }
              }).catch(error => {
                reject(error)
              })
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
