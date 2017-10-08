<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="人事信息">
      <a slot="right" @click="save">保存</a>
    </x-header>
    <div>
      <group>
        <cell title="员工编号" @click.native="toEmpNum" :is-link="true" :value="currentProfile.idInCompany" valueTextAlign="left" :hdFlex="1" :valueFlex="2.1">
        </cell>
        <!--<x-input :hdFlex="1" :bdFlex="2.1" title='员工编号' rel="dataTimeChoice" placeholder="请输入" :show-clear="false" v-model="currentProfile.idInCompany" confirm-text="确定" cancel-text="取消">-->
        <!--</x-input>-->
        <popup-picker :hdFlex="1" :valueFlex="2.2" title="员工状态"
                      confirmText="完成"
                      cancel-text="取消"
                      value-text-align="left"
                      @on-change="changeState"
                      :data="empStateArr"
                      v-model="empStateDetail"
                      placeholder="请选择"></popup-picker>
        <!--<cell  @click.native="empRegularSwitch" :hdFlex="1" :valueFlex="1.7" valueTextAlign="left" title="员工状态" :value="regDate">-->
          <!--<a v-show="currentProfile.personalPositionStatus === 1" slot="child" class="btn_state"  @click.stop="empRegularSwitch" :style="{'color':empInfo.btnColor,'borderColor':empInfo.btnBorderColor}">{{empInfo.btnText}}</a>-->
          <!--<datetime v-show="currentProfile.personalPositionStatus === 0" slot="child" title="" :hdFlex="1" style="padding: 0;" :valueFlex="2" valueTextAlign="left" clearText="显示当前时间" @on-clear="setToday" class="relStatus"  format="YYYY-MM-DD" v-model="currentProfile.regularDate" :min-year="1949" :max-year="2114" placeholder="请选择" confirmText="确定" cancelText="取消">-->
            <!--<a class="btn_state" :style="{'color':empInfo.btnColor,'borderColor':empInfo.btnBorderColor}">{{empInfo.btnText}}</a>-->
          <!--</datetime>-->
        <!--</cell>-->
      </group>
      <group>
        <datetime :hdFlex="1" :valueFlex="2.1" valueTextAlign="left" title="入职日期" format="YYYY-MM-DD" v-model="currentProfile.employedDate" :min-year="1949" :max-year="2114" placeholder="请选择" confirmText="确定" cancelText="取消"></datetime>
        <datetime v-show="currentProfile.personalPositionStatus !== 1" ref="" :hdFlex="1" :valueFlex="2.1" valueTextAlign="left" title="拟转正日期" format="YYYY-MM-DD" v-model="currentProfile.dateSupposeToBeRegular" :min-year="1949" :max-year="2114" placeholder="请选择" confirmText="确定" cancelText="取消"></datetime>
        <datetime v-show="currentProfile.personalPositionStatus === 1" ref="dataTimeChoice"
                  clearText="设为当前时间"
                  @on-clear="setToday"
                  :hdFlex="1"
                  :valueFlex="2.1"
                  valueTextAlign="left"
                  title="转正日期"
                  format="YYYY-MM-DD"
                  v-model="currentProfile.regularDate"
                  :min-year="1949"
                  :max-year="2114"
                  placeholder="请选择" confirmText="确定" cancelText="取消"></datetime>
      </group>
      <group>
        <cell :hdFlex="1" :valueFlex="2.2" title="所属部门" valueTextAlign="left" v-model="currentProfile.departmentName"></cell>
        <cell :hdFlex="1" :valueFlex="2.2" title="职位" valueTextAlign="left" v-model="currentProfile.positionInMp"></cell>
      </group>
      <group >
        <cell :hdFlex="1" :valueFlex="2.2" title="员工级别" @click.native="setEmpLevel" :isLink="!showSet" valueTextAlign="left" v-model="empLevelData">
          <a v-if="showSet" @click.stop="setEmpType" class="btn_state" >去设置</a>
        </cell>
      </group>
      <!--<group v-show="showSet">-->
        <!--<popup-picker title="员工类型" confirmText="完成"  cancel-text="取消" value-text-align="left" :data="empType" v-model="emp.typeName" @on-change="changeType" placeholder="请选择"></popup-picker>-->
        <!--<popup-picker title="级别"  confirmText="完成" cancel-text="取消" value-text-align="left" :data="empLevel" v-model="emp.level" placeholder="请选择"></popup-picker>-->
      <!--</group>-->
      <group v-show="[330,12,2042].indexOf(userInfo.companyId) !== -1">
        <popup-picker title="阿米巴级别"  confirmText="完成" cancel-text="取消" value-text-align="left" :data="amoeba.levelList" v-model="amoeba.level" placeholder="请选择"></popup-picker>
      </group>
      <group :titleFooter="holidayTitle">
        <x-input title="年假天数" :hdFlex="1" :bdFlex="2.1" type="number" placeholder="请输入" :show-clear="false" v-model="currentProfile.totalAnnualLeaveDays"></x-input>
      </group>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '../../../../components/x-header/index.vue'
  import Cell from '../../../../components/cell/index.vue'
  import Group from '../../../../components/group/index.vue'
  import XInput from '../../../../components/x-input/index.vue'
  import Selector from '../../../../components/selector/index.vue'
  import XTextarea from '../../../../components/x-textarea/index.vue'
  import Datetime from '../../../../components/datetime/index.vue'
  import Loading from '../../../../components/loading/index.vue'
  import PopupPicker from '../../../../components/popup-picker/index.vue'
  import dateFormat from '../../../../tools/date/format'
  import {getDateStr} from '../../../../libs/utils'
  import clone from 'lodash.clonedeep'
  export default {
    created () {
      var self = this;
      this.userInfo = this.$store.getters.getUserInfo;
      this.currentProfile = clone(this.$store.state.editCurrentProfile);

      //获取员工状态列表；如果获取的是空list则初始化三个基础项(试用期，实习，正式员工)
      this.$store.dispatch('getStaffStatusList').then(function (res) {
        if(res.item.length === 0){
          self.empInit.forEach(function (obj) {
            if(obj.statuId === self.currentProfile.personalPositionStatus){
              self.empStateDetail.push(obj.statuDesc);
            }
          })
        }else{
          self.empInit = res.item;
          var list = [[]];
          res.item.forEach(function (obj) {
            list[0].push(obj.statuDesc)
          })
          self.empStateArr = list;

          if(self.currentProfile.personalPositionStatus === undefined){
            self.currentProfile.personalPositionStatus = 0;
          }else{
            res.item.forEach(function (obj) {
              if(self.currentProfile.personalPositionStatus === obj.statuId){
                self.empStateDetail.push(obj.statuDesc);
              }
            })
          }
        }
        self.showLoading = false;
      })
      //如果hr管理员为设置员工等级 则隐藏员工等级列
      this.$store.dispatch('get_empType_list').then(function (res) {
        if(res.data.length === 0){
          self.showSet = true;
        }
      })

      if(this.currentProfile.regularDate === undefined){
        this.$set(this.currentProfile, 'regularDate','');
      }

      //设置员工等级初始化
      if(this.currentProfile.typeName !==undefined&&this.currentProfile.typeCode !== undefined){
        this.emp.typeName[0] = this.currentProfile.typeName+" ("+this.currentProfile.typeCode+")";
        this.emp.level[0] = this.currentProfile.mainLevel.toString();
      }
      //阿米巴等级
      if(this.userInfo.companyId === 330 ||this.userInfo.companyId === 12){
        console.log(this.amoeba.levelList[0][this.currentProfile.amoebaLevel-1])
        this.amoeba.level.push(this.amoeba.levelList[0][this.currentProfile.amoebaLevel-1]);
      }
    },
    components: {
      XHeader,
      Cell,
      Group,
      XInput,
      Selector,
      XTextarea,
      Datetime,
      PopupPicker,
      Loading
    },
    data () {
      return {
        loadingText:'',
        showLoading:true,
        tempTime:'',//用于员工状态之间切换
        flagIndex:0,//用于标记第一次进入页面
        empStateArr:[['实习期','试用期','正式员工']],
        empStateDetail:[],
        userInfo:{},
        empInit:[{
          statuId:0,
          statuDesc:'试用期',
        },{
          statuId:2,
          statuDesc:'实习期',
        },{
          statuId:1,
          statuDesc:'正式员工'
        }],
        empInfo:{
            empState:'',
            btnText:'',
            btnColor:'',
          },
        visibility:false,
        showSet:false,
        currentProfile: {
          regularDate:''
        },
        maritalStatusList: [
          {key: '1', value: '单身'},
          {key: '2', value: '恋爱中'},
          {key: '3', value: '已婚'},
          {key: '4', value: '离异'},
          {key: '5', value: '丧偶'},
        ],
        defaultValue: '',
        emp:{
          typeName:[],
          level:[]
        },
        amoeba:{
          level:[],
          levelList:[['司令','军长','师长','旅长','团长','营长','连长','排长','班长','业务员']]
        }
      }
    },
    computed:{
      regDate(){
          if(this.currentProfile.personalPositionStatus === 0){
              this.empInfo.btnText = "转正";
              this.empInfo.btnColor = "#4a90e2";
              this.empInfo.btnBorderColor = "#4a90e2";
              return "试用期"
          }else if(this.currentProfile.personalPositionStatus === 1){
            this.empInfo.btnText = "撤回";
            this.empInfo.btnColor = "#FE3824";
            this.empInfo.btnBorderColor = "#FE3824";
            return "正式员工"
          }
      },
      empLevelData(){
        if(this.emp !== undefined && this.emp.typeName.length !== 0){
          return this.emp.typeName[0]+'  '+this.emp.level[0]+'级';
        }
      },
      holidayTitle(){
          var text = "";
          if(this.currentProfile.currentProfile===undefined){
              text='请输入该员工拥有的年假天数，如留空则默认不享有年假';
          }else{
            text='您可以对员工的年假总天数进行修改，修改结果会对当前年假天数和剩余天数进行同步更新';
          }
          return text;
      }
    },
    methods: {
      save () {
        //阿米巴等级
        if(this.userInfo.companyId === 330 ||this.userInfo.companyId === 12){
          this.currentProfile.amoebaLevel = this.amoeba.levelList[0].indexOf(this.amoeba.level[0]) + 1;
        }
        this.$store.state.editCurrentProfile = this.currentProfile;

        this.$router.back()
      },
      toEmpNum(){
//        this.$store.state.editCurrentProfile = clone(this.currentProfile);
        this.$store.dispatch('setEditCurrentProfile',clone(this.currentProfile)).then(res =>{
          console.log(this.$store.getters.getEditCurrentProfile);
          this.$router.push({name:'empNumber'})
        })

      },
      changeState(value){
        var self = this;
        if(value[0] === '正式员工'){
          self.currentProfile.personalPositionStatus = 1;
          if(self.flagIndex > 0 && self.currentProfile.regularDate === ''){
            self.currentProfile.regularDate = getDateStr(0)
          }else{

          }
        }else{
          self.empInit.forEach(function (obj) {
            if(value[0] === obj.statuDesc){
              self.currentProfile.personalPositionStatus = obj.statuId;
            }
          })
        }
        self.flagIndex++
      },
      setEmpLevel(){
        if(!this.showSet){
//          this.$store.dispatch('setEditCurrentProfile',this.currentProfile);
          this.$store.state.editCurrentProfile = clone(this.currentProfile);
          console.log(this.$store.state.editCurrentProfile);
          this.$router.push({name:'empLevel'})
        }
      },
      setEmpType(){
        this.$router.push({name:'empType'});
      },
      changeType(){
          this.emp.level = [];
      },
      empRegularSwitch(){
          if(this.currentProfile.personalPositionStatus === 1){
            this.currentProfile.personalPositionStatus = 0;
          }else if(this.currentProfile.personalPositionStatus === 0){
            this.currentProfile.personalPositionStatus = 1;
          }
      },
      setToday(){
          var today = dateFormat(new Date(), 'YYYY-MM-DD');
          this.currentProfile.regularDate = today;
      }
    }
  }
</script>
<style>
  .pd-left{
    padding-left: 10px;
  }
  .relStatus{
    float: right;
    /* width: auto; */
    padding: 0;
  }
  .btn_state{
    border: 1px solid #4a90e2;
    color: #4a90e2;
    font-size: 13px;
    border-radius: 4px;
    display: block;
    padding: 0 8px;
    max-width: 40px;
  }
</style>
