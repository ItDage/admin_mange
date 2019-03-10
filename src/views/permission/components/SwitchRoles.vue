<template>
  <div class="custom-tree-container">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div class="block">
          <el-button type="primary" size="small" @click="updateRoles">保存</el-button>
        </div>
      </el-col>
    </el-row>
    <hr>
    <el-row :gutter="10">
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="block">
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"/>
          <el-tree
            ref="tree2"
            :data="data"
            :props="defaultProps"
            :filter-node-method="filterNode"
            node-key="id"
            class="filter-tree"
            default-expand-all
            @node-click="getCheckedKeys"
          />
      </div></el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="block">
          <el-input
            v-model="filterText2"
            placeholder="输入关键字进行过滤"/>
          <el-tree
            ref="roleTree"
            :data="data2"
            :props="defaultProps"
            :filter-node-method="filterNode2"
            node-key="id"
            show-checkbox
            class="filter-tree"
            default-expand-all
          />
      </div></el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    const data2 = [{ }]
    const data = [{ }]
    return {
      submitData: {
        selectUser: 0,
        roleIds: ''
      },
      filterText: '',
      filterText2: '',
      data: JSON.parse(JSON.stringify(data)),
      data2: JSON.parse(JSON.stringify(data2)),
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    },
    filterText2(val) {
      this.$refs.roleTree.filter(val)
    }
  },
  created() {
    // 加载数据
    this.loadData()
    // 加载角色数据
    this.loadRoleData()
  },
  mounted() {
    // 绑定第一个用户列表的角色
    console.log(JSON.stringify(this.data))
    // this.bindFirstUserRole()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    filterNode2(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getCheckedKeys(data) {
      this.submitData.selectUser = data.id
      this.setCheckedNodes(data)
    },
    setCheckedNodes(data) {
      var arr = this.data[0].children
      for (var index in arr) {
        if (arr[index].id === data.id) {
          this.$refs.roleTree.setCheckedNodes(arr[index].role)
        }
      }
    },
    loadData() {
      this.$store.dispatch('getUsers').then(res => { // 拉取user
        const data = res.data.data // 获取用户数据
        this.data = data
      }).catch((err) => {
        console.log(err)
      })
    },
    loadRoleData() {
      this.$store.dispatch('getAllRole').then(res => { // 拉取user
        const data = res.data.data // 获取用户数据
        this.data2 = data
      }).catch((err) => {
        console.log(err)
      })
    },
    updateRoles() {
      // 更新用户角色
      console.log(this.$refs.roleTree.getCheckedNodes())
      const roles = this.$refs.roleTree.getCheckedNodes()
      var roleIds = new Array(roles.length)
      for (var i = 0; i < roles.length; i++) {
        roleIds.push(roles[i].id)
      }
      this.submitData.roleIds = roles
      console.log('submitData' + JSON.stringify(this.submitData))
      this.$store.dispatch('updateRole', this.submitData).then(res => { // 拉取user
        const data = res.data.data // 获取用户数据
        console.log(data)
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
</style>
