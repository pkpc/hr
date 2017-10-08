<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="员工编号">
    </x-header>

    <div class="container">
      <group>
        <cell title="新建类型" @click.native="addType" :valueFlex="1" class="color-blue" is-link></cell>
      </group>
      <div v-if="items.length > 0" class="mt-12" style="background-color: #FFFFFF">
        <swipeout>
          <!--<swipeout-item @on-close="handleEvents('on-close')" @on-open="handleEvents('on-open')" :right-menu-width="80" transition-mode="follow">-->
          <swipeout-item v-for="(item,index) in items" :key="index" :right-menu-width="btnWidth" transition-mode="follow">
            <div slot="right-menu">
              <swipeout-button :width="btnWidth" @click.native="onButtonClick(item)" type="warn">{{'删除'}}</swipeout-button>
            </div>
            <div slot="content" class="demo-content vux-1px-t">
              <div class="flex-row-start ftsize15 h44" @click="editType(item.id)" style="background-color: #FFFFFF">
                <span class="ml-16">{{item.serialName}}</span>
                <span class="ml-10">{{item.serialPrefix}}</span>
                <!--<span class="ml-10">{{"("+item.minimum +"-"+ item.maximum+")"}}</span>-->
              </div>
            </div>
          </swipeout-item>
        </swipeout>
      </div>
    </div>
    <loading v-model="showLoading" :text="loadingText"></loading>
  </div>
</template>
<script>
  import XHeader from '.././../../components/x-header/index.vue'
  import Cell from '.././../../components/cell/index.vue'
  import Group from '.././../../components/group/index.vue'
  import Loading from '.././../../components/loading/index.vue'
  import {Swipeout,SwipeoutItem, SwipeoutButton} from '../../../components/swipeout'

  export default {
    components:{
      XHeader,
      Group,
      Cell,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      Loading
    },
    created(){
      this.loadData();
    },
    data(){
      return {
        items:[],
        btnWidth:60*dpr,
        showLoading:true,
        loadingText:''
      }
    },
    methods:{
      loadData(){
        var self = this;
        this.$store.dispatch('getSerialNumberPlans').then(function (res) {
          if(res.result === 0){
            self.items = res.data;
          }
          self.showLoading = false;
        })
      },
      onButtonClick(item){
        var self = this;
        this.$store.dispatch('deleteSerialNumberPlan',item).then(function (res) {
          if(res.result === 0){
            self.showToast('删除成功');
            self.loadData();
          }
        })
      },
      editType(id){
        this.$store.dispatch('setEmpNumber',{id:id});
        this.$router.push({name:'numTypeDetail'});
      },
      addType(){
        this.$store.dispatch('setEmpNumber',{});
        this.$router.push({name:'numTypeDetail'});
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
