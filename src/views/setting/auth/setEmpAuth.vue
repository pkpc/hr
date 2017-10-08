<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" :title="this.auth.title">
      <a slot="right" @click="save">确定</a>
    </x-header>
    <mp-multiple-choice :contactsArr="getContacts" :departmentsArr="getDepartments" :selectedId="selectedId" ref="mpMultipleChoice" :selectModuleTitle="moduleTitle"></mp-multiple-choice>
  </div>
</template>
<script>
  import XHeader from '../../../components/x-header/index'
  import MPMultipleChoice from '../../../components/mp-multiple-choice/index'
  import {mapGetters} from 'vuex'
  export default {
    components: {
      XHeader,
      'mp-multiple-choice': MPMultipleChoice
    },
    data(){
        return{
            auth:{}
        }
    },
    created(){
      this.auth = this.$store.state.authParams;
    },
    computed: {
      selectedId () {
        let arr = []
        var self = this;
        if(self.auth.flag === 1){
            if(self.auth.haveAuthEmp !== undefined){
              self.auth.haveAuthEmp.forEach(function (obj) {
                arr.push(obj.contactId)
              })
            }
        }else if(self.auth.flag === 2){
            if(self.auth.isAllSelectedRange ===1){
                self.getContacts.forEach(function (r) {
                  arr.push(r.contactId)
                });
            }else{
              if(self.auth.range !== undefined){
                self.auth.range.forEach(function (obj) {
                  arr.push(obj.contactId)
                })
              }
              if(self.auth.departments !== undefined){
                self.auth.departments.forEach(function (n) {
                  self.getContacts.forEach(function (r) {
                      if(r.departmentPath !== undefined && r.departmentPath.length > 0){
                        if(r.departmentPath.indexOf(n) !== -1){
                          arr.push(r.contactId)
                        }
                      }
                  })
                })
              }
            }
        }
        return arr
      },
      ...mapGetters([
        'getUserInfo',
        'getContacts',
        'getDepartments'
      ]),
      moduleTitle () {
        return this.getUserInfo.companyName + ' (' + this.getUserInfo.companycount + ')'
      }
    },
    methods: {
      save() {
          var authParams = this.$store.getters.getAuthParams;
        this.$vux.loading.show({
          text: '正在保存...'
        });
        const self = this;
        let selected = [];
        var choice = this.$refs.mpMultipleChoice;
        choice.selectedPerson.forEach(function (obj) {
          selected.push(obj)
        });
        if(self.auth.flag === 1){
          authParams.haveAuthEmp = selected;
        }else if(self.auth.flag === 2){
          authParams.range = [];
          authParams.departments = [];
          authParams.contactIds = [];
          if(choice.isAllSelected){
            authParams.isAllSelectedRange = 1;
          }else{
            authParams.isAllSelectedRange = 0;
            choice.dataSource.forEach(function (n) {
                var index = 0;
                if(n.selected){
                    //为整个部门全部被选中的情况
                  if(n.id === undefined){
                    //为无部门时
                    n.members.forEach(function (r) {
                      authParams.contactIds.push(r.contactId);
                    });
                  }else{
                    authParams.departments.push(n.id);
                    index++
                    if(n.members !== undefined && n.members.length > 0){
                      n.members.forEach(function (r) {
                        if(r.selected){
//                          authParams.contactIds.push(r.contactId);
                        }
                      });
                    }
                    //含有部门分支
                    if(n.branches !== undefined){
                      n.branches.forEach(function (b) {
                        selectBranchDept(b,index)
                      })
                    }
                  }
                }else{
                  //部门没有被全选的情况
                  if(n.members !== undefined && n.members.length > 0){
                    n.members.forEach(function (r) {
                      if(r.selected){
                        authParams.contactIds.push(r.contactId);
                      }
                    });
                  }
                  //含有部门分支
                  if(n.branches !== undefined){
                    n.branches.forEach(function (b) {
                      selectBranchDept(b,index)
                    })
                  }
                }
              function selectBranchDept(n,index) {
                if(n.selected){
                  if(n.id === undefined){
                    //为无部门时
                    n.members.forEach(function (r) {
//                      authParams.contactIds.push(r.contactId);
                    });
                  }else{
                    if(index === 0){
                      authParams.departments.push(n.id);
                      index++
                    }
                    if(n.members !== undefined && n.members.length > 0){
                      n.members.forEach(function (r) {
                        if(r.selected){
//                          authParams.contactIds.push(r.contactId);
                        }
                      });
                    }
                    //含有部门分支
                    if(n.branches !== undefined){
                      n.branches.forEach(function (b) {
                        selectBranchDept(b,index)
                      })
                    }
                  }
                }else{
                  if(n.members !== undefined && n.members.length > 0){
                    n.members.forEach(function (r) {
                      if(r.selected){
                        authParams.contactIds.push(r.contactId);
                      }
                    });
                  }
                  //含有部门分支
                  if(n.branches !== undefined){
                    n.branches.forEach(function (b) {
                      selectBranchDept(b,index)
                    })
                  }
                }
              }
            })
          }
            authParams.range = selected;
        }
        this.$store.dispatch('setAuthParams',authParams).then(function (res) {
          self.$vux.loading.hide();
          self.$router.push("/setting/auth/authDetail");
        })
      }
    }
  }
</script>
<style>
  .is-iPhone .mb60{
    margin-bottom: 120px;
  }
</style>

