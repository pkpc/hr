<template>
  <div>
    <x-header @on-click-back="backSetting" :left-options="{showBack: true,backText: '',preventGoBack:true}" title="员工信息完善">
      <img src="../../../../static/img/Plus@3x.png" slot="right" @click.stop="addCard" class="img-add">
    </x-header>
    <div >
      <cell-desc v-if="showCard && cardList.length === 0" @click.native="addCard">
        <cell title="选择需开放权限的员工" valueColor="#8F8E94" :isLink="true"></cell>
        <div class="dashBottom"></div>
        <div slot="desc-title" class="desc-list-hd">可见范围</div>
        <div slot="desc-body" class="desc-list-bd">
          <span class="desc-span">全部员工</span>
        </div>
        <div slot="desc-second-title" class="desc-list-sd">可见内容</div>
        <div slot="desc-second-body" class="desc-list-bd">
          <span class="desc-span">手机</span>
        </div>
      </cell-desc>
      <!--<swipeout>-->
      <swipeout-item v-if="showCard && detailList.length > 0" v-for="(item,index) in detailList" :key="index"  transition-mode="follow">
        <div slot="right-menu">
          <swipeout-button @click.native="onButtonClick(index)" :width="btnWidth" type="warn">删除</swipeout-button>
        </div>
        <div slot="content" class="demo-content vux-1px-t">
          <cell-desc  @click.native="editCard(index)">
            <cell :title=item.title is-link class="no-wrap-desc" valueColor="#8F8E94" :valueFlex="0.2">编辑</cell>
            <div class="dashBottom"></div>
            <div slot="desc-title" class="desc-list-hd">可见范围</div>
            <div slot="desc-body" class="desc-list-bd">
              <span class="desc-span">{{item.rangeTitle}}</span>
            </div>
            <div slot="desc-second-title" class="desc-list-sd">可见内容</div>
            <div slot="desc-second-body" class="desc-list-bd">
              <span class="desc-span">{{item.contentTitle}}</span>
            </div>
          </cell-desc>
        </div>
      </swipeout-item>
      <!--</swipeout>-->
    </div>
  </div>
</template>
<script>
  import XHeader from '../../../components/x-header/index.vue'
  import Group from '../../../components/group/index.vue'
  import Cell from '../../../components/cell/index.vue'
  import CellDesc from '../../../components/cell-desc/index.vue'
  import {Swipeout,SwipeoutItem, SwipeoutButton} from '../../../components/swipeout'
  import {mapGetters} from 'vuex'

  export default{
      created(){
          var self = this;
        this.$store.dispatch('getOptionalSeeingSettings').then(function (res) {
            var newList = res.data.sort(self.compare("id"));
            self.$store.dispatch('setAuthList',newList);
            self.cardList = newList;
            self.detailList = [];
            //处理成卡片能直接使用的文字形式
            if(newList.length > 0){
              newList.forEach(function (n) {
                var param ={};
                //装入开放权限
                if(n.contactIds.length === 1){
                    param.title = n.contactIds[0].name +"  "+n.contactIds[0].position;
                }else if(n.contactIds.length <= 3){
                    var temp = "";
                    n.contactIds.forEach(function (r) {
                     temp = temp +"、"+ r.name
                    });
                    param.title = temp.substring(1);
                }else{
                  param.title = n.contactIds[0].name +"、" +n.contactIds[1].name +"、" +n.contactIds[2].name +"等";
                }
                //装入可见范围
                var rTitle = "";
                if(n.people === undefined && n.departments === undefined){
                    rTitle = "全部员工";
                    param.rangeTitle = rTitle;
                }else{
                    if(n.people !== undefined){
                      n.people.forEach(function (n) {
                        rTitle = rTitle +"、"+n.name;
                      });
                    }
                  if(n.departments !== undefined){
                    n.departments.forEach(function (n) {
                      rTitle = rTitle +"、"+n.name;
                    });
                  }
                  param.rangeTitle = rTitle.substring(1);
                }

                //装入可见内容
                var cTitle = "";
                n.options.forEach(function (n) {
                  cTitle = cTitle +"、"+n.name;
                })
                param.contentTitle = cTitle.substring(1);
                self.detailList.push(param);
              })
            }
          self.showCard = true;
        })
      },
      data(){
        return{
          showCard:false,
          cardList:[],
          detailList:[]
        }
      },
      components:{
        XHeader,
        Group,
        Cell,
        CellDesc,
        Swipeout,
        SwipeoutItem,
        SwipeoutButton
      },
      methods:{
        onButtonClick(index){
          this.detailList.splice(index,1);
          var self = this;
          this.$store.dispatch('removeAuthList',index).then(function (res) {
            if(res.result === 0){
                self.toastShow("删除成功")
            }
          })
        },
        addCard(){
        var params ={
            flag:1,
          title:' 选择开放权限的员工'
        }
        var self = this;
        this.$store.dispatch('setAuthParams',params).then(function () {
          self.$router.push('/setting/auth/setEmpAuth');
        });

      },
        backSetting(){
          this.$router.push('/setting')
        },
        editCard(index){
            var edited = this.cardList[index];
            var self = this;
            var data = {
              haveAuthEmp:[],
              range:[],
              checkList:[],
              id:edited.id
            };
            data.haveAuthEmp = edited.contactIds;
            if(edited.people === undefined && edited.departments === undefined){
                data.isAllSelectedRange = 1;
            }
          if(edited.people !== undefined){
                data.contactIds = [];
            data.range = edited.people;
            edited.people.forEach(function (n) {
              data.contactIds.push(n.contactId)
            })
          }
            if(edited.departments !== undefined && edited.departments.length > 0){
                data.departments = [];
                edited.departments.forEach(function (n) {
                  data.departments.push(n.deptId);
                  self.getContacts.forEach(function (r) {
                    if(r.departmentPath !== undefined && r.departmentPath.length > 0){
                      if(r.departmentPath.indexOf(n.deptId.toString()) !== -1){
                        data.range.push(r)
                      }
                    }
                  })
              })
            }
            edited.options.forEach(function (res) {
              data.checkList.push(res.name);
            });
            this.$store.dispatch('setAuthParams',data);
            this.$router.push({name:'authDetail',params:{index:index}});
        },
        compare(prop){
          return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (val1 < val2) {
              return 1;
            } else if (val1 > val2) {
              return -1;
            } else {
              return 0;
            }
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
    },
    computed:{
      ...mapGetters([
        'getContacts'
      ]),
      btnWidth(){
          return 70*document.getElementsByTagName("html")[0].getAttribute("data-dpr");
      }
    }
  }
</script>
<style>
  .img-add{
    width:19px;
    height:19px;
  }
  .desc-span{
    line-height:21px;
  }
  .weui-cells:after{
    border-bottom: none!important;
  }
.dashBottom{
  margin-left:16px;
  width:96%;
  /*height:2px;*/
  border-top:1px #ddd dashed;
}
  .desc-list-sd{
    font-size: 0.266667rem;
    padding: 0.026667rem 0.106667rem;
    margin-right: 0.48rem;
    margin-top: 0.32rem;
    border-radius: 0.106667rem;
    background-color: #FFCF4A;
    color: #333;
    -webkit-align-self: flex-start;
    align-self: flex-start;
  }
</style>
