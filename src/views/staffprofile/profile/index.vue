<template>
  <div>
    <x-header :left-options="{showBack: true,backText: ''}" title="员工档案">
      <a href="javascript:" v-if="getUserInfo.isAdmin || getUserInfo.isHRManager==1 || getUserInfo.mainContactId==profileData.mainContactId" @click="showEditPage" slot="right">编辑</a>
    </x-header>
    <div>
      <div class="profile_hd">
        <div class="profile_hd_left">
          <img v-if="profileData.headImgUrl" :src="'https://www.erplus.co/uploads/avatars'+profileData.headImgUrl"
               alt="">
          <div class="hd_left_title">
            <p class="left_title_main">
              {{profileData.nameInMp!==undefined?profileData.nameInMp:profileData.name}}
              <span v-if="profileData.age" class="after_title">{{profileData.age}}岁</span>
              <span v-if="profileData.sex==0 || profileData.sex==1" class="after_title"
                    :class="{'ion-female': profileData.sex==0, 'ion-male': profileData.sex==1}"></span>
            </p>
            <p class="left_title_sub">{{profileData.positionInMp!==undefined?profileData.positionInMp:profileData.position}}</p>
          </div>
        </div>
        <div class="profile_hd_right">
          <div class="profile_hd_right_bd" v-show="empPosition" :class="[empPosition]" ></div>
        </div>
      </div>
      <router-link to="preview/record" tag="p" append class="profile_update_btn">
        <!--<img class="icon_clock" src="../../../../static/img/icon_clock.png" alt="">-->
        <!--<i class="ion-ios-clock-outline"></i>-->
        <!--<img src="../../../../static/img/clock.png" class="update-record">-->
        <span v-if="redPoint" class="red-point"></span>
        查看更新记录
      </router-link>
      <group titleBackground="#f7f7f7">
        <cell v-if="hasAuth ||authList.indexOf('phoneInMp') !== -1 || isSelf" title="手机" :valueFlex="2" valueTextAlign="left">
          <span slot="value">{{profileData.phoneInMp}}</span>
          <img slot="child" @click="callPerson(profileData.phoneInMp)" class="icon_telephone" src="../../../../static/img/icon_telephone.png" alt="">
        </cell>
        <cell v-if="hasAuth ||authList.indexOf('birthday') !== -1 || isSelf" :title="profileData.isLunarBirth == 1 ? '农历生日' : '公历生日'" :link="{name: 'previewBirth'}" :valueFlex="2" valueTextAlign="left" is-link>
          <p slot="value">{{profileData.isLunarBirth == 1 ? profileData.lunarBirthday : profileData.birthday}}</p>
        </cell>
        <cell v-if="hasAuth ||authList.indexOf('hometown') !== -1 || isSelf" title="籍贯" :valueFlex="2" valueTextAlign="left">{{profileData.hometown}}</cell>
        <cell v-if="hasAuth ||authList.indexOf('idcard') !== -1 || isSelf" title="身份证号" :valueFlex="2" valueTextAlign="left">{{profileData.idcard}}</cell>
      </group>
      <cell-collapse v-if="hasAuth ||authList.indexOf('FAMILY_INFO') !== -1 || isSelf" title="家庭信息" is-link :items="familyList"></cell-collapse>
      <cell-collapse v-if="hasAuth ||authList.indexOf('HR_INFO') !== -1 || isSelf" title="人事信息" is-link :items="personnelList"></cell-collapse>
      <cell-collapse v-if="hasAuth ||authList.indexOf('SALARY_INFO') !== -1 || isSelf" title="薪资信息（税前）" is-link :items="salaryList"></cell-collapse>
      <cell-collapse v-if="hasAuth ||authList.indexOf('ATTACHMENT_INFO') !== -1 || isSelf" title="相关附件" is-link collapseType="gallery">
        <div class="mp_cell_gallery" slot="cell-more">
          <img class="mp_cell_gallery_photo " v-for="(item, index) in sortUpAttachmentList" :src="item.src"
               @click="previewImage (index)"/>
        </div>
      </cell-collapse>
      <div v-if="profileData.remark" class="profile_remark">
        {{profileData.remark}}
      </div>
    </div>
    <previewer :list="sortUpAttachmentList" ref="previewer" :options="options"></previewer>
  </div>
</template>
<script>
  import XHeader from '../../../components/x-header/index.vue'
  import Group from '../../../components/group/index.vue'
  import Cell from '../../../components/cell/index.vue'
  import CellCollapse from '../../../components/cell-collapse/index.vue'
  import XButton from '../../../components/x-button/index.vue'
  import XInput from '../../../components/x-input/index.vue'
  import Previewer from '../../../components/previewer/index.vue'
  import {mapGetters} from 'vuex'
  import {isEmptyObject,sortObjectByOption} from '../../../libs/utils'
  import dateFormat from '../../../../src/tools/date/format'
  import cloneDeep from 'lodash.clonedeep'

  export default {
    components: {
      XHeader,
      Group,
      Cell,
      XButton,
      XInput,
      CellCollapse,
      Previewer
    },
    data () {
      return {
        stateList:[],
        redPoint:false,
        isSelf:false,
        authList:[],//查看权限列表
        familyList: [{
          label: '情感状况：',
          value: ''
        }, {
          label: '家庭住址：',
          value: ''
        }, {
          label: '紧急联络人：',
          value: ''
        },{
          label: '关系：',
          value: ''
        }, {
          label: '联系电话：',
          value: ''
        }],
        personnelList: [{
          label: '员工编号：',
          value: ''
        },{
          label: '员工状态：',
          value: ''
        },{
          label: '入职日期：',
          value: ''
        }, {
          label: '拟转正日期：',
          value: ''
        }, {
          label: '所属部门：',
          value: ''
        }, {
          label: '职位：',
          value: ''
        }, {
          label: '员工级别：',
          value: ''
        },
          {
          label: '年假天数：',
          value: ''
        }
        ],
        salaryList: [{
          label: '试用期基础薪资：',
          value: ''
        },{
          label: '试用期绩效薪资：',
          value: ''
        }, {
          label: '转正后基础薪资：',
          value: ''
        }, {
          label: '转正后绩效薪资：',
          value: ''
        }],
        attachmentList: [],
        options: {
          getThumbBoundsFn (index) {
            // find thumbnail element
            let thumbnail = document.querySelectorAll('.mp_cell_gallery_photo')[index]
            // get window scroll Y
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
            // optionally get horizontal scroll
            // get position of element relative to viewport
            let rect = thumbnail.getBoundingClientRect()
            // w = width
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
            // Good guide on how to get element coordinates:
            // http://javascript.info/tutorial/coordinates
          }
        },
        userInfo:{}
      }
    },
    computed: {
      ...mapGetters([
        'getContacts',
        'getUserInfo'
      ]),
      sortUpAttachmentList(){
        if(this.attachmentList.length > 0){
          return this.attachmentList.sort(sortObjectByOption('id'));
        }else{
          return []
        }
      },
      hasAuth () {
        // 是老板 或者 HR
        return !!(this.getUserInfo.isAdmin || this.getUserInfo.isHRManager)
      },
      profileData () {
        return this.$store.state.currentProfile
      },
      empPosition () {
        var tempSrc = ''
        if (this.profileData.isAdmin === true) {
          // Admin
          tempSrc = 'icon_position_boss'
        } else if (this.profileData.isAssistantManager === 1) {
          if (this.profileData.departmentName === '无部门') {
            // 副总
            tempSrc = 'icon_position_assist_mgr1'
          } else {
            // 副主管
            tempSrc = 'icon_position_assist_mgr2'
          }
        } else if (this.profileData.isDepManager === true) {
          // 主管
          tempSrc = 'icon_position_mgr'
        }
        return tempSrc
      }
    },
    created () {
      let self = this
      self.userInfo = this.$store.getters.getUserInfo;

      var currentContactId = parseInt(self.$route.params.id);
      var currentMainContactId = 0;
//      var stateList = [];
      var currentContact = {}

      var companyId = self.userInfo.companyId;
      if (currentContactId === self.getUserInfo.mainContactId) {
        self.isSelf = true;
      }
      let today = dateFormat(new Date(), 'YYYY-MM-DD')
      // 判断当前是否有已选人资料
      this.getContacts.some(function (contact) {
        // 获取主身份 信息
        if (contact.id === currentContactId) {
          currentMainContactId = contact.mainContactId.toString();
//          if (contact.profileId === 0) {
          //profileId 后端已废除
          if (contact.profileId === -1) {
            currentContact = contact
//            delete currentContact['id']
            currentContact.mainContactId = contact.mainContactId
            currentContact.name = contact.name
            currentContact.headImgUrl = contact.imageName
            currentContact.deptName = contact.department
            currentContact.deptId = contact.departmentId
            currentContact.position = contact.position
            currentContact.phoneInMp = parseInt(contact.phone)
            if (currentContactId === self.getUserInfo.mainContactId) {
              currentContact.isSelf = true;
            }
            currentContact = cloneDeep(currentContact)
            self.$store.commit('SET_CURRENT_PROFILE', currentContact)
            self.$store.commit('UPDATE_EDIT_CURRENT_PROFILE', currentContact)
            return true
          } else {
            self.$vux.loading.show({
              text: '加载中...'
            })
            self.$store.dispatch('getStaffStatusList').then(function (res) {
              if(res.result === 0){
                if(res.item.length === 0){
                  self.stateList = [{
                    statuId:2,
                    statuDesc:'实习期',
                  },{
                    statuId:0,
                    statuDesc:'试用期',
                  },{
                    statuId:1,
                    statuDesc:'正式员工',
                  }]
                }else{
                  self.stateList = res.item;
                }
              }
              let getProfileApi = '';
              if (currentContactId === self.getUserInfo.mainContactId) {
                getProfileApi = 'GET_MY_PROFILE'
              } else {
                getProfileApi = 'GET_PROFILE_DETAIL'
              }
              self.$store.dispatch(getProfileApi, {
//              id: contact.profileId,
                id: 0,
                mainContactId: contact.mainContactId,
                contactId:contact.contactId
              }).then(function(res) {
                res.mainContactId = contact.mainContactId;
                if (res.personalEmotionStatus !== undefined) {
                  self.familyList[0].value = self.changeEmotionStatus(res.personalEmotionStatus)
                }
                self.familyList[1].value = res.homeAddress
                self.familyList[2].value = res.emergencyContact
                self.familyList[3].value = res.emergencyContactRelation
                self.familyList[4].value = res.emergencyContactPhone
                self.personnelList[0].value = res.idInCompany
                self.personnelList[2].value = res.employedDate
//              if (res.dateSupposeToBeRegular < today) {
//                self.personnelList[2].label = '转正日期:'
//              }
                self.stateList.forEach(function (obj) {
                  if(obj.statuId === res.personalPositionStatus){
                    self.personnelList[1].value = obj.statuDesc;
                  }
                })
                if(res.personalPositionStatus === 1){
                  self.personnelList[3].label = '转正日期';
                  self.personnelList[3].value = res.regularDate;
                }else{
                  self.personnelList[3].label = '拟转正日期:';
                  self.personnelList[3].value = res.dateSupposeToBeRegular;
                }

                self.personnelList[4].value = res.departmentName;
                self.personnelList[5].value = res.positionInMp;
                if(res.typeName !== undefined){
                  self.personnelList[6].value = res.typeName+" ("+res.typeCode+") "+res.mainLevel+"级";
//                self.personnelList[7].value = res.mainLevel
                }else{
                  self.$store.dispatch('get_empType_list').then(function (res) {
                    if(res.result === 0){
                      if(res.data.length === 0){
                        self.personnelList[6].setEmpLevel = true;
                      }
                    }
                  })
                }
                //暂时阿米巴只适用在特定的公司;
                // 阿米巴列表在年假之前，所以年假列位置会发生移动
                if(companyId === 330){
                  var list = ['司令','军长','师长','旅长','团长','营长','连长','排长','班长','业务员'];
                  self.personnelList[7].label = '阿米巴级别：';
                  if(res.amoebaLevel !== 0){
                    if(res.amoebaLevel === 10){
                      self.personnelList[7].value = list[res.amoebaLevel-1];
                      self.personnelList[7].amoeba = false;
                    }else{
                      self.personnelList[7].value = list[res.amoebaLevel-1];
                      self.personnelList[7].amoeba = true;
                      self.personnelList[7].level = res.amoebaLevel;
                    }
                  }else{
                    self.personnelList[7].value = "";
                    self.personnelList[7].amoeba = false;
                    self.personnelList[7].level = 1;
                  }

                  var params = {
                    label: '年假天数：',
                    value : (res.totalAnnualLeaveDays===undefined?0:res.totalAnnualLeaveDays)+"天",
                    show : true,
                    id : res.mainContactId
                  };
                  self.personnelList.push(params)

                }else{
                  //年假天数
                  self.personnelList[7].value = (res.totalAnnualLeaveDays===undefined?0:res.totalAnnualLeaveDays)+"天";
                  self.personnelList[7].show = true;
                  self.personnelList[7].id = res.mainContactId;
                }

                if (res.attachments !== undefined && res.attachments.length > 0) {
                  res.attachments.forEach(function (atm) {
                    self.getImgNaturalDimensions(atm, self.addImgToList)
                  })
                }
                self.$vux.loading.hide()
                return self.$store.dispatch('DECODE_DATA', res)

              }).then(function (res) {
                if (res.respCode === '000') {
                  var currentProfile = self.$store.state.currentProfile;
                  self.salaryList[0].value = currentProfile.probationaryPeriodSalary;
                  self.salaryList[1].value = currentProfile.probationaryKPISalary;
                  self.salaryList[2].value = currentProfile.regularSalary;
                  self.salaryList[3].value = currentProfile.regularKPISalary;
                  self.$vux.loading.hide()
                }
                return self.$store.dispatch('getRedPoint')
              }).then(function (res) {
                if(res.result == 0){
                  var currentProfile = self.$store.state.currentProfile;
                  if(res.item > 0){
                    if(res.list.length === 0){
                      self.redPoint = true;
                    }else if(res.list.indexOf(currentProfile.mainContactId) !== -1){
                      self.redPoint = true;
                    }
                  }else{
                    self.redPoint = false;
                  }
                }
              })
            });
          }
          self.$store.dispatch('getWhatKiddaDetailICanSee',{mainContactId:currentMainContactId}).then(function (res) {
              if(res.result === 0){
                var authList = res.data.authList;
                if(authList.length >0){
                  authList.forEach(function (obj) {
                    self.authList.push(obj.codeName);
                  })
                }
              }
          })
        }
      })

    },
    methods: {
      callPerson(number){
        var obj = {
          tag:'tel',
          phone:number
        }
        let ua = window.navigator.userAgent.toLowerCase()
        try {
          if (/iphone|ipad|ipod/.test(ua)) {
            window.webkit.messageHandlers.iOS.postMessage(obj)
          } else if (/android/.test(ua)) {
            window.location.href = 'tel:'+number;
            window.Android.postMessage(JSON.stringify(obj).replace(/"/g, '\''))
          }
        } catch (e) {

        }

      },
      previewImage (index) {
        this.$refs.previewer.show(index)
      },
      changeEmotionStatus (value) {
        var str = ''
        switch (value) {
          case 1:
            str = '单身'
            break
          case 2:
            str = '恋爱中'
            break
          case 3:
            str = '已婚'
            break
          case 4:
            str = '离异'
            break
          case 5:
            str = '丧偶'
            break
          default:
            str = ''
        }
        return str
      },
      addImgToList (img, imgWidth, imgHeight) {
        this.attachmentList.unshift({
          src: img.attachment,
          w: imgWidth,
          h: imgHeight,
          id:img.id
        })
      },
      getImgNaturalDimensions (img, callback) {
        // 根据src获取图片真实宽高
        var image = new Image()
        image.src = img.attachment
        image.onload = function() {
          callback(img, image.width, image.height)
        }
      },
      showEditPage () {
        if (this.getUserInfo.isAdmin === true || this.getUserInfo.isHRManager === 1 || this.getUserInfo.mainContactId=== this.profileData.mainContactId) {
          this.$router.push({path: this.$route.path + '/edit'})
        }
      }
    }
  }
</script>
<style rel="stylesheet/less" lang="less" scoped>
  .red-point{
    display: inline-block;
    width:8px;
    height:8px;
    background-color: #f74c31;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    margin-right: 8px;
  }
  .update-record{
    width:12px;
    height:12px;
    margin-right: 5px;
  }
  .profile_hd {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 104px;
    padding: 0 15px;
    margin-top: 12px;
    background-color: #fff;
    .profile_hd_left {
      position: relative;
      display: flex;
      align-items: center;
      img {
        width: 67px;
        height: 67px;
        border-radius: 100%;
        margin-right: 17px;
      }
    }
    .profile_hd_right {
      position: relative;
      display: flex;
      align-items: center;
      .profile_hd_right_bd {
        width: 50px;
        height: 52px;
      }
    }
  }

  .hd_left_title {
    .left_title_main {
      padding-bottom: 7px;
      font-size: 18px; /*px*/
      .after_title {
        color: #777;
        font-size: 14px; /*px*/
        &.ion-female {
          color: #ff2744
        }
        &.ion-male {
          color: #2196f3
        }
      }
    }
    .left_title_sub {
      font-size: 13px; /*px*/
    }
  }

  .profile_update_btn {
    align-items: center;
    justify-content: center;
    display: flex;
    height: 44px;
    border-top: 1px solid #efefef; /*no*/
    background-color: #fff;
    color: #4a90e2;
    font-size: 14px; /*px*/
    .ion-ios-clock-outline {
      margin-right: 5px;
    }
  }

  .icon_clock {
    width: 13px;
    height: 13px;
    margin-right: 5px;
  }

  .icon_telephone {
    width: 16px;
    height: 16px;
  }

  .mp_cell_gallery > div {
    height: 100px;
    width: 100%;
    flex: 1;
    display: flex;
    /*position: relative;*/
    flex-wrap: nowrap;
  }

  .mp_cell_gallery img {
    width: 100px;
  }
  .profile_remark {
    font-size: 15dpx;
    margin-top: 12px;
    padding: 15px;
    height: 120px;
    background-color: #fff;
  }
  .icon_position_boss {
    background: url("../../../../static/img/boss-hr-icon.png") center center no-repeat;
    background-size: 100% 100%;
  }
  .icon_position_assist_mgr1 {
    background: url("../../../../static/img/secondBoss.png") center center no-repeat;
    background-size: 100% 100%;
  }
  .icon_position_assist_mgr2 {
    background: url("../../../../static/img/AssistantManager.png") center center no-repeat;
    background-size: 100% 100%;
  }
  .icon_position_mgr {
    background: url("../../../../static/img/manager-icon.png") center center no-repeat;
    background-size: 100% 100%;
  }
</style>
