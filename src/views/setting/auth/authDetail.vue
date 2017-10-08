<template>
  <div>
    <x-header @click.native="backIndex" :left-options="{showBack: true,backText: '',preventGoBack:true}" title="员工档案查看权限">
      <span slot="right" @click.stop="save">确定</span>
    </x-header>
    <div class="container">
      <group>
        <cell title="开放权限的员工" titleColor="#4A90E2" @click.native="openAuth" :isLink="true" valueColor="#8F8E94">{{haveAuthEmp}}</cell>
      </group>
      <group>
        <cell title="可见范围" titleColor="#4A90E2" @click.native="rangeEmp" :isLink="true" valueColor="#8F8E94">{{range}}</cell>
      </group>
      <group>
        <cell title="可见内容" titleColor="#4A90E2"></cell>
        <checklist position="right" :options="commonList" v-model="checklist" @on-change="change"></checklist>
      </group>
      <div v-if="auth.id !==undefined" @click="removeCard" class="btn_delete">删除</div>
    </div>
  </div>
</template>
<script>
  import XHeader from '../../../components/x-header/index.vue'
  import Group from '../../../components/group/index.vue'
  import Cell from '../../../components/cell/index.vue'
  import Checklist from '../../../components/checklist/index.vue'
  import {mapGetters} from 'vuex'

  export default{
    created(){
          var self = this;
          this.auth =  this.$store.getters.getAuthParams;
          this.checklist = this.auth.checkList;
          this.$store.dispatch('getAvailableToSetAuthOptions').then(function (res) {
              self.options = [];
              self.options = res.data.options;
              self.commonList = [];
              res.data.options.forEach(function (n) {
                self.commonList.push(n.name);
              })
          })
      },
    components:{
      XHeader,
      Group,
      Cell,
      Checklist
    },
    data(){
        return{
          options:[],
          commonList:[],
          checklist:[],
          auth:{}
        }
    },
    methods:{
      change(){

      },
      rangeEmp(){
          var self = this;
        this.auth.flag = 2;
        this.auth.title = '可见范围';
        this.auth.checkList = this.checklist;
        this.$store.dispatch('setAuthParams',this.auth).then(function (res) {
          self.$router.push('/setting/auth/setEmpAuth');
        })

      },
      openAuth(){
        this.auth.flag = 1;
        this.auth.title = '选择开放权限的员工';
        this.auth.checkList = this.checklist;
        this.$router.push('/setting/auth/setEmpAuth');
      },
      backIndex(){
        this.$router.push('/setting/auth/visualAuth');
      },
      save(){
          var self = this;
          var params ={
            contactIds:[],
            options:[],
//            people:[]
          }
          //验证
          if(this.auth.haveAuthEmp === undefined || this.auth.haveAuthEmp.length === 0){
            this.toastShow('请选择开放权限的员工');
            return false;
          }
          if(this.auth.isAllSelectedRange !== 1){
            if(this.auth.range === undefined || this.auth.range.length === 0){
              this.toastShow('请选择可见范围');
              return false;
            }
          }
          if(this.checklist.length === 0){
            this.toastShow('请选择可见内容');
            return false;
          }
          //装入开放权限的员工
        this.auth.haveAuthEmp.forEach(function (n) {
          var param ={
            contactId:n.contactId
          }
          params.contactIds.push(param);
        });
        //装入可见内容
        this.checklist.forEach(function (n) {
          self.options.forEach(function (res) {
            if(res.name === n){
                const param = {
                  codeName:res.codeName
                };
                params.options.push(param);
                return false;
            }
          })
        });
        this.$vux.loading.show({});
        if(this.auth.id !== undefined){
            params.id = this.auth.id;
            if(this.auth.isAllSelectedRange !== 1){
              //装入可见范围
              if(this.auth.departments !== undefined && this.auth.departments.length >0 ){
                params.departments  = [];
                  this.auth.departments.forEach(function (n) {
                    var deptParam ={
                      deptId:n
                    }
                    params.departments.push(deptParam);
                  })
              }
              if(this.auth.contactIds !== undefined && this.auth.contactIds.length >0 ){
                params.people = [];
                this.auth.contactIds.forEach(function (n) {
                  var param ={
                    contactId:n
                  }
                  params.people.push(param);
                })
              }
            }
          this.$store.dispatch('updateOptionalSeeingSettings',params).then(function (res) {
            if(res.result === 0){
              self.$vux.loading.hide();
              self.$router.push('/setting/auth/visualAuth')
            }
          })
        }else{
          if(this.auth.isAllSelectedRange !== 1){
            //装入可见范围
            if(this.auth.departments !== undefined && this.auth.departments.length >0 ){
              params.departments  = [];
              this.auth.departments.forEach(function (n) {
                var deptParam ={
                  deptId:n
                }
                params.departments.push(deptParam);
              })
            }
            if(this.auth.contactIds !== undefined && this.auth.contactIds.length >0 ){
              params.people = [];
              this.auth.contactIds.forEach(function (n) {
                var param ={
                  contactId:n
                }
                params.people.push(param);
              })
            }
          }
          this.$store.dispatch('saveOptionalSeeingSettings',params).then(function (res) {
            if(res.result === 0){
              self.$vux.loading.hide();
              self.$router.push('/setting/auth/visualAuth')
            }
          })
        }

      },
      toastShow(res){
        this.$vux.toast.show({
          type:'text',
          text: res,
          position:'bottom',
          width:'auto'
        })
      },
      removeCard(){
        const params ={
            id:this.auth.id
        }
        var self = this;
        this.$store.dispatch('removeAuthList',params).then(function (res) {
            self.toastShow("删除成功")
          self.$router.push('/setting/auth/visualAuth')
        })
      }
    },
    computed:{
      ...mapGetters([
        'getContacts'
      ]),
      haveAuthEmp(){
       var list = this.$store.getters.getAuthParams.haveAuthEmp;
       if(list === undefined || list.length === 0){
         return '未选择';
       }else if(list.length<=3){
           var str = [];
           list.forEach(function (n) {
             str.push(n.name);
           })
           return str.join(",");
       }else if(list.length > 3){
           return list.length +"人";
       }
      },
      range(){
          var self = this;
          if(this.auth.isAllSelectedRange === 1){
              return "全部员工"
          }else{
            var list = this.auth.range;
            if(list === undefined ||list.length === 0){
              return '未选择';
            }else if(list.length<=3){
              var str = [];
              list.forEach(function (n) {
                str.push(n.name);
              });
              return str.join(",");
            }else if(list.length > 3){
              return list.length +"人";
            }
          }
      },

    }
  }
</script>
<style>
  .flex-row-center{
    display: flex;
    justify-content:center;
    align-items: center;
  }
  .btn_delete{
    margin-top:30px;
    height:44px;
    background-color: #FFFFFF;
    color:#E64340;
    font-size: 15px;
    margin-bottom: 20px;
    text-align: center;
    line-height:44px;
  }
  .weui-cells_checkbox .weui-cell__hd {
    padding-right: 0!important;
  }
</style>
