<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="员工状态">
      <span @click="save" slot="right">确定</span>
    </x-header>
    <div>
      <group>
        <cell title="添加员工状态" @click.native="addState">
          <img slot="icon" class="img-add" src="../../../static/img/icon_addOption.png"/>
        </cell>
      </group>
      <group>
        <draggable v-model="empStateList"  :options="{group:'name',sort:true,handle:'.img-drag',animation:150}" @start="dragging=true" @end="dragging=false">
          <div v-for="(item,index) in empStateList" :key="index">
            <left-slider :dataSource="item" :disabled="true" :index="index" @deleteItem="deleteItem(item,index)" ref="swipeoutItem" class="sales-contact-flag">
              <div class="flex-row-start full-height">
                <img  class="img-drag" src="../../../static/img/icn_drag.png"/>
                <input :id="'input-'+index" :class="['noBorder','input-'+index]" v-if="item.showInput || item.statuDesc.length ===0" @focus="getFocus(item)" @blur="lossFocus(item)" v-model="item.statuDesc" placeholder="请输入"/>
                <div @click="switchInput(item,index)" class="flex-row-start full-width" v-if="!item.showInput">
                  <span>{{item.statuDesc}}</span>
                  <span v-if="(item.statuId > 2 ||item.statuId === undefined) && item.statuDesc.length>0" class="cell-btn-a">自定义</span>
                </div>
              </div>
            </left-slider>
          </div>
        </draggable>
      </group>
      <div class="flex-row-center mt-35 mb-35">
        <img class="img-bulb" src="../../../static/img/icon_bulb.png">
        <span class="color-grey">点击即可直接编辑，自定义项可左滑删除</span>
      </div>
    </div>
    <loading v-model="showLoading" text=""></loading>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index.vue'
  import Cell from '../../components/cell/index.vue'
  import Group from '../../components/group/index.vue'
  import LeftSlider from '../../components/left-slider/index.vue'
  import XInput from '../../components/x-input/index.vue'
  import Draggable from 'vuedraggable'
  import clone from 'lodash.clonedeep'
  import Loading from '../../components/loading/index.vue'
  import {sortObjectByOption} from '../../libs/utils'

  export default {
    components:{
      XHeader,
      Cell,
      Group,
      LeftSlider,
      XInput,
      Draggable,
      Loading
    },
    created(){
      this.getEmpStateList();
    },
    data(){
      return {
        showLoading:false,
        initData:false,
        showInput:false,
        tempList:[],
        empStateList:[]
      }
    },
    methods:{
      switchInput(item,index){
        if(item.statuId > 2 ||item.statuId === undefined){
          item.showInput = true;
//          console.log(document.getElementById('input-'+index))
//          console.log(document.getElementsByClassName('input-'+index)[0])
//          document.getElementById('input-'+index).focus()
        }
      },
      getEmpStateList(){
        var self = this;
        this.$store.dispatch('getStaffStatusList').then(function (res) {
          if(res.result === 0){
            if(res.item.length === 0){
              self.initData = true;
              //给公司初始化；默认显示这三项
              var temp = [{
                sortRecord:0,
                statuId:0,
                statuDesc:'试用期',
                showInput:false,
                operatorFlag:1
              },{
                sortRecord:1,
                statuId:2,
                statuDesc:'实习期',
                showInput:false,
                operatorFlag:1
              },{
                sortRecord:2,
                statuId:1,
                statuDesc:'正式员工',
                showInput:false,
                operatorFlag:1
              }]
              self.empStateList = clone(temp);
              self.tempList = clone(temp);
            }else{
              var temp = clone(res.item).sort(sortObjectByOption('sortRecord'));
              temp.forEach(function (res) {
                if(res.statuId >2){
                  res.showInput = false;
                }
              })
              self.empStateList = temp;
              self.tempList = clone(res.item);
            }
          }

        })
      },
      save(){
        var self = this;
        self.showLoading = true;
        var repeatList = [];
        var haveCG = false;
        this.empStateList.forEach(function (n,index) {
          if (n.statuDesc === "") {
            haveCG = true;
            return false;
          }
          repeatList.push(n.statuDesc);
        })
        if(self.isRepeat(repeatList)){
          self.showToast("存在重复的状态名");
          self.showLoading = false;
          return false;
        }else if(haveCG){
          self.showToast("存在无效的状态名");
          self.showLoading = false;
          return false;
        }else{
          self.empStateList.forEach(function (obj,index) {
            obj.sortRecord = index;
            if(obj.statuId === undefined){
              obj.operatorFlag = 1;
            }else{
              self.tempList.forEach(function (n) {
                if(n.statuId === obj.statuId && n.statuDesc !== obj.statuDesc){
                  obj.operatorFlag = 2;
                }
              })
            }
          })
          this.$store.dispatch('saveStaffStatu',self.empStateList).then(function (res) {
            if(res.result === 0){
              self.getEmpStateList();
              self.$router.back();
              self.showToast('保存成功');
              self.showLoading = false;
            }
          })
        }
      },
      isRepeat(arr){
        var hash = {};
        for(var i in arr) {
          if(hash[arr[i]])
            return true;
          hash[arr[i]] = true;
        }
        return false;
      },
      deleteItem(item,index){
        if(item.statuId < 3){
          this.showToast('该项不能删除')
        }else if(item.statuId === undefined){
          this.empStateList.splice(index,1);
          this.$refs.swipeoutItem.forEach(function (n) {
            n._closed();
          });
        }else{
          var self = this;
          self.empStateList.forEach(function (obj) {
            if(obj.statuId === item.statuId){
              obj.operatorFlag = -1;
            }
          });
          this.$store.dispatch('saveStaffStatu',self.empStateList).then(function (res) {
            if(res.result === 0){
              self.$refs.swipeoutItem.forEach(function (n) {
                n._closed();
              });
              self.getEmpStateList();
              self.showToast('删除成功')
            }
          })
        }

      },
      addState(){
        var flag = this.empStateList.some(function (obj) {
          return obj.statuDesc === ''
        })
        if(flag){
          this.showToast('请先输入员工状态')
        }else{
          this.empStateList.push({
            statuDesc:'',
            operatorFlag:1,
            showInput:true
          })
        }
      },
      getFocus(item){
        console.log("----")
      },
      lossFocus(item){
        console.log(item.showInput)
        if(item.statuId >2 || item.statuId === undefined){

          item.showInput = false;
          console.log(item.showInput)
        }
        console.log("--+++--")
      },
      showToast(res){
        this.$vux.toast.show({
          type:'text',
          position:'bottom',
          width:'auto',
          text:res
        })
      }
    }
  }
</script>
<style>
  .full-height{
    height:44px;
    background-color: #FFFFFF;
  }
  .full-width{
    width:100%;
  }
  .cell-btn-a{
    color: #4a90e2;
    font-size:8px;
    border:1px solid #4a90e2;
    display: inline-block;
    width:auto;
    padding:0 5px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    margin-left:5px;
  }
  .color-grey{
    color: #999999;
  }
  .sales-contact-flag{
    position: relative;
  }
  .sales-contact-flag:before{
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 0.026667rem;
    border-top: 0.026667rem solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 0.4rem;
    z-index:99;
  }
  .mb-35{
    margin-bottom: 35px;
  }
  /*.vux-header + div {*/
  /*-webkit-overflow-scrolling: auto!important;*/
  /*}*/
  .mt-35{
    margin-top:35px;
  }
  .img-bulb{
    width:18px;
    height:18px;
    margin-right:7px;
    vertical-align: middle;
  }
  .flex-row-center{
    display: flex;
    flex-flow: row nowrap;
    justify-content:center;
    align-items: flex-end;
    height:44px;
  }
  .img-drag{
    /*margin-left:16px;*/
    width:18px;
    height:18px;
    margin-right:13px;
    margin-left:16px;
    /*vertical-align: middle;*/
  }
  .noBorder{
    border:none;
    font-size: 15px;
    height:100%;
    width:100%;
    -webkit-tap-highlight-color:rgba(0,0,0,0);
  }
  .flex-row-start{
    display: flex;
    flex-flow: row nowrap;
    justify-content:flex-start;
    align-items: center;
  }
  .img-add{
    width:18px;
    height:18px;
    margin-right:13px;
    vertical-align: middle;

  }
  .img-confirm{
    width:166px!important;
    height:99px;
    margin-top: 20px;
  }
  .close-confirm{
    width:13px;
    height:13px;
    position: absolute;
    top:14px;
    right: 14px;
  }
</style>
