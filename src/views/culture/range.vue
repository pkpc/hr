<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="适用范围">
      <a slot="right" @click="save">确定</a>
    </x-header>
    <mp-multiple-choice :currContactId="getUserInfo.id" :contactsArr="getRangeContacts" :departmentsArr="getDepartments" :selectedId="selectedId" ref="mpMultipleChoice" :selectModuleTitle="moduleTitle"></mp-multiple-choice>
    <x-dialog v-model="showHideTips" :scroll="false">
      <div class="weui-dialog__banner">
        <img src="../../../static/img/allSelected.png" class="img-confirm" alt="">
      </div>
      <div>
        <p class="tip-title">适用全部员工</p>
        <p class="tip-recording">您知道吗？当适用范围选择全公司后，未来如果有新的员工加入公司，也会被系统默认选中，并可直接查看该栏目内的文章。</p>
      </div>
      <div class="weui-dialog__ft">
        <a @click="knowThat(false)" href="javascript:;" class="dialog_btn">知道了</a>
      </div>
    </x-dialog>
  </div>
</template>
<script>
  import XHeader from '../../components/x-header/index'
  import XDialog from '../../components/x-dialog/index'
  import MPMultipleChoice from '../../components/mp-multiple-choice/index'
  import {mapGetters} from 'vuex'
  export default {
    created(){
      this.culture = this.$store.getters.getCulture;
      this.flagText = this.$route.params.target;
    },
    components: {
      XHeader,
      'mp-multiple-choice': MPMultipleChoice,
      XDialog
    },
    data(){
      return {
        culture:{},
        contacts:[],
        showHideTips:false,
        flagText:'',//标注是由哪个页面进来的
      }
    },
    computed: {
      selectedId () {
        let selectedIdArr = []
        if (this.$store.state.culture.range !== undefined && this.$store.state.culture.range === 'all') {
          this.$store.state.contacts.forEach(function (contact) {
            selectedIdArr.push(contact.contactId)
          })
        } else {
          if (this.$store.state.culture.range !== undefined && this.$store.state.culture.range !== "") {
            this.$store.state.culture.range.forEach(function (n) {
              selectedIdArr.push(n)
            })
          }
        }
        return selectedIdArr
      },
      ...mapGetters([
        'getUserInfo',
        'getContacts',
        'getDepartments'
      ]),
      moduleTitle () {
        return this.getUserInfo.companyName + ' (' + this.getUserInfo.companycount + ')'
      },
      getRangeContacts(){
        var list = [];
        this.getContacts.forEach(function (obj) {
          if (obj.isIdirector === undefined && (obj.isIdirector !== 1 || obj.isIdirector !== true)) {
            // 只保留非独董员工

            list.push(obj)
          }else{
            console.log(obj)
          }
        })
        return list;
      }
    },
    methods: {
      save () {
        var self = this;
        let selected = [];
        let selectedMainId = [];
        this.$refs.mpMultipleChoice.selectedPerson.forEach(function (obj) {
          selected.push(obj.id);
          selectedMainId.push(obj.mainContactId)
        })
        if (selected.length === this.$store.state.contacts.length) {
          selected = 'all';
          selectedMainId = 'all';
          this.showHideTips = true;

          this.culture.range = selected;
          this.culture.mainRange = selectedMainId;
        }else{
          this.culture.range = selected;
          this.culture.mainRange = selectedMainId;

          this.$store.dispatch('setCulture',this.culture).then(function () {
            if(self.flagText === 'editRange'){
              var params = {};
              if(self.culture.range === 'all'){
                params = {
                  articleId:self.culture.articleId,
                  range:self.culture.range,
                  mainRange:self.culture.mainRange
                }
              }else{
                params = {
                  articleId:self.culture.articleId,
                  range:self.culture.range.join(','),
                  mainRange:self.culture.mainRange.join(',')
                }
              }
              console.log(params)
              self.$store.dispatch('updateArticleReadRange',params).then(res =>{
                if(res.result === 0){
                  self.$router.back()
                }

              })
            }else{
              self.$router.back()
            }
          });
        }

      },
      knowThat(){
        this.showHideTips = !this.showHideTips;
        var self = this;
        this.$store.dispatch('setCulture',this.culture).then(function () {
          if(self.flagText === 'editRange'){
            var params = {
              articleId:self.culture.articleId,
              range:self.culture.range,
              mainRange:self.culture.mainRange
            }
            self.$store.dispatch('updateArticleReadRange',params).then(res =>{
              if(res.result === 0){
                self.$router.back()
              }
            })
          }else{
            self.$router.back()
          }

        });
      }
    }
  }
</script>
<style scoped>
  .dialog_btn{
    display: inline-block;
    vertical-align: top;
    padding:0 .8em;
    color: #000;
    width: 100%;
  }
  .weui-dialog{
    width:75%!important;
  }
  .weui-dialog__ft{
    /*border-top: 1px solid #D2D3D5;*/
    display: flex;
    justify-content: center;
  }
  .img-confirm{
    width:166px!important;
    height:99px;
    margin-top: 20px;
  }
  .tip-recording{
    padding:0 22px 10px;
    color: #999999;
    text-align: left;
    font-size: 14px;
  }
  .tip-title{
    text-align: left;
    padding: 10px 22px;
    color: #333333;
    font-size: 17px;
  }
  .dialog_tip{
    color: #333333!important;
  }
</style>

