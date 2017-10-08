import Vue from 'vue'
import Vuex from 'vuex'
import api from './api'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    release:0, //用于区分内测和正式版，0为正式，1为内测
    userInfo: {}, // 用户信息
    contacts: [], // 通讯录
    departments: [], // 公司部门
    hrManager: [], // hr管理员
    cultureManager: [], // 文化栏管理员
    hrSetting: {}, // hr设置 参数
    hrSettingTemp: {},
    birthSetting: {}, // 生日设置 参数
    birthRangeSelected: '', /*生日提醒适用范围*/
    staffProfileList: [], /*员工档案列表*/
    currentProfile: {}, /*当前员工档案*/
    editCurrentProfile: {}, /*编辑状态员工档案*/
    applicationList: [],
    basicProfileList: [],
    basicProfileListExpandedDept: [],
    empType:[], //员工类型
    empLevel:{}, //员工最终的等级
    authParams:{}, //员工档案查看权限的参数
    authList:[],  //卡片列表
    authContactVisibleList:[], //查看权限可见范围ctid列表
    culture:{},  //文化栏
    attachmentList:[],  //附件列表
    dataSourceTemp:'', //用于记录展开列的数据
    empNumber:{},  //员工编号
    showSignIn:true, //是否首次进入员工档案，为true时需要输入密码
  },
  getters: {
    getEditCurrentProfile(state){
      return state.editCurrentProfile
    },
    getRelease(state){
      return state.release
    },
    getEmpNumber(state){
      return state.empNumber
    },
    getAttachmentList(state){
      return state.attachmentList
    },
    getDataSourceTemp(state){
      return state.dataSourceTemp
    },
    getCulture(state){
      return state.culture;
    },
    getAuthParams(state){
      return state.authParams;
    },
    getEmpLevel(state){
      return state.empLevel;
    },
    getEmpType(state){
      return state.empType;
    },
    getUserInfo (state) {
      return state.userInfo
    },
    getContacts (state) {
      return state.contacts
    },
    getDepartments (state) {
      return state.departments
    },
    getStaffProfileList (state) {
      return state.staffProfileList
    }
  },
  mutations: {
    SET_EMP_NUMBER(state,params){
      state.empNumber = params;
    },
    SET_CULTURE_MANAGER(state,params){
      state.cultureManager = params;
    },
    SET_CULTURE(state,params){
      state.culture = params;
    },
    REMOVE_AUTH_LIST(state,index){
      state.authList.splice(index,1)
    },
    SET_AUTH_LIST(state,params){
      state.authList = params;
    },
    SET_AUTH_PARAMS(state,params){
      state.authParams = params;
    },
    SET_EMP_LEVEL(state,params){
      state.empLevel = params;
    },
    EDIT_EMP_TYPE(state,params){
      state.empType[params.index] = params.empType;
    },
    REMOVE_EMP_TYPE(state,index){
      state.empType.splice(index,1)
    },
    ADD_EMP_TYPE(state,data){
      state.empType.push(data);
    },
    SET_EMP_TYPE(state,data){
      state.empType = data;
    },
    IS_HR (state, data) {
      if (data.item !== undefined) {
        state.hrManager = data.item
        data.item.forEach(function (obj) {
          if (obj.contactId === state.userInfo.id) {
            Vue.set(state.userInfo, 'isHRManager', 1)
          }
        })
      }
    },
    IS_CULTURE_MANAGER (state, data) {
      if (data.item !== undefined) {
        state.cultureManager = data.item;
        data.item.forEach(function (obj) {
          if (obj.contactId === state.userInfo.id) {
            Vue.set(state.userInfo, 'isCultureManager', 1)
          }
        })
      }
    },
    SET_HR_MANAGER (state, data) {
      state.hrManager = data
    },
    SET_USER_INFO (state, data) {
      state.userInfo = data
    },
    SET_CONTACTS (state, data) {
      state.contacts = []
      data.forEach(function (obj) {
        if (obj.isIdirector !== 1 && obj.isIdirector !== true) {
          obj.contactId = obj.id
          state.contacts.push(obj)
        }
      })
    },
    SET_DEPARTMENTS (state, data) {
      state.departments = data
    },
    SET_HR_SETTING (state, data) {
      state.hrSetting = data
    },
    SET_BIRTH_SETTING (state, data) {
      state.birthSetting = data
    },
    SET_BIRTH_REMIND_RANGE (state, data) {
      if (data.range === 'all') {
        data = []
        state.contacts.forEach(function (obj) {
          data.push(obj.id)
        })
        data = data.join(',')
      } else {
        data = data.range
      }
      state.birthSetting.range = data
      state.birthRangeSelected = data
    },
    SET_STAFF_PROFILE_LIST (state, data) {
      state.staffProfileList = data.data
      // 在通讯录中添加下列属性
      state.contacts.forEach(function (contact) {
        Vue.set(contact, 'isCompleted', false)
        contact.isCompleted = state.staffProfileList.some(function (obj) {
          if (contact.mainContactId === obj.mainContactId) {
            contact.age = obj.age
            contact.sex = obj.sex
            contact.profileId = obj.id
            return true
          }
        })
        if (!contact.isCompleted) {
          // 默认profile id
          contact.profileId = 0
        }
      })
    },
    SET_EDIT_CURRENT_PROFILE (state, data) {
      state.editCurrentProfile = data
      console.log("=====")
      console.log(state.editCurrentProfile);
    },
    UPDATE_EDIT_CURRENT_PROFILE (state, data) {
      state.editCurrentProfile = data
    },
    SET_CURRENT_PROFILE (state, data) {
      if (data.mainContactId === state.userInfo.mainContactId) {
        data.isSelf = true
      }
      // 更新 contacts 里的profileId
      state.contacts.forEach(function (contact) {
        if (contact.mainContactId === data.mainContactId) {
          // 多身份
          contact.profileId = data.profileId
        }

        if (contact.id === data.contactId) {
          // 主身份
          data.isAdmin = contact.isAdmin
          data.isAssistantManager = contact.isAssistantManager
          data.isDepManager = contact.isDepManager
          data.isAssistantManager = contact.isAssistantManager
          data.departmentName = contact.departmentName
          data.departmentId = contact.departmentId
          data.phoneInMp = parseInt(data.phoneInMp)
        }
      })
      state.currentProfile = data
    },
    SET_APPLICATION_LIST (state, data) {
      state.applicationList = data
    },
    SET_STAFF_PROFILE_LIST_EXPANDED_DEPT (state, data) {
      if (state.basicProfileListExpandedDept.length > 0) {
        let isExisted = state.basicProfileListExpandedDept.some(function (obj, index) {
          if (obj.id === data.id) {
            if (data.expanded) {

            } else {
              state.basicProfileListExpandedDept.splice(index, 1)
            }
            return true
          }
        })
        if (!isExisted) {
          if (data.expanded) {
            state.basicProfileListExpandedDept.push(data)
          }
        }
      } else {
        if (data.expanded === true) {
          state.basicProfileListExpandedDept.push(data)
        }
      }
    }
  },
  actions: {
    //编辑阅读范围，已读的人不会收到红点提示
    updateArticleReadRange ({commit},data){
      return api.updateArticleReadRange(data).then(res => {
        return res.data
      })
    },
    //已读未读列表
    getReadArticlePeople ({commit},data){
      return api.getReadArticlePeople(data).then(res => {
        return res.data
      })
    },
    //获取适用范围列表
    getArticleRange ({commit},data){
      return api.getArticleRange(data).then(res => {
        return res.data
      })
    },
    //判断员工编号是否重复
    isAlreadyExistSerialNum ({commit},data){
      return api.isAlreadyExistSerialNum(data).then(res => {
        return res.data
      })
    },
    //登录
    signIn ({commit},data){
      return api.signIn(data).then(res => {
        return res.data
      })
    },
    //获取(编号方案类型为1)下一个可用编号
    getSerialNumberPlanNextNumber ({commit},data){
      return api.getSerialNumberPlanNextNumber(data).then(res => {
        return res.data
      })
    },
    //删除人事信息的员工编号方案
    deleteSerialNumberPlan ({commit},data){
      return api.deleteSerialNumberPlan(data).then(res => {
        return res.data
      })
    },
    //编辑人事信息的员工编号方案
    editSerialNumberPlan ({commit},data){
      return api.editSerialNumberPlan(data).then(res => {
        return res.data
      })
    },
    //添加人事信息的员工编号方案
    addSerialNumberPlan ({commit},data){
      return api.addSerialNumberPlan(data).then(res => {
        return res.data
      })
    },
    //获取员工编号方案列表
    getSerialNumberPlans ({commit},data){
      return api.getSerialNumberPlans(data).then(res => {
        return res.data
      })
    },
    //从列表中某个员工方案的详情
    getSerialNumberPlanDetail ({commit},data){
      return api.getSerialNumberPlanDetail(data).then(res => {
        return res.data
      })
    },
    //获取公司设置的员工状态
    getStaffStatusList ({commit}){
      return api.getStaffStatusList().then(res => {
        return res.data
      })
    },
    //保存(添加、修改、删除)公司员工状态
    saveStaffStatu ({commit},data){
      return api.saveStaffStatu(data).then(res => {
        return res.data
      })
    },
    //获取红点
    getRedPoint ({commit}){
      return api.getRedPoint().then(res => {
        return res.data
      })
    },

    /**
     * 文化栏部分开始
     * @param params
     * @returns {Promise.<TResult>|*}
     */
    // 获取文化栏 Manager
    GET_CULTURE_MANAGER ({commit, state}) {
      let cultureData = {}
      cultureData.companyId = state.userInfo.companyId
      cultureData.authType = 42
      return api.fetchHRAuth(cultureData).then(res => {
        if (res.data.result === '0') {
          commit('SET_CULTURE_MANAGER', res.data.item)
        }
        return res.data
      })
    },
    setCultureManager({commit,state},payLoad){
      payLoad.authType = 42;
      payLoad.companyId = state.userInfo.companyId;
      return api.saveHRManager(payLoad).then(res => {
        if (res.data.result === '0') {
          commit('SET_CULTURE_MANAGER', payLoad.contactIds.split(','))
        }
        return res.data
      })
    },
    //最外层红点接口
    topicRedpoint({},params){
      return api.topicRedpoint(params).then(function (res) {
        return res.data;
      });
    },
    //删除文章
    deleteArticle({},params){
      return api.deleteArticle(params).then(function (res) {
        return res.data;
      });
    },
    //搜索文章
    searchArticle({},params){
      return api.searchArticle(params).then(function (res) {
        return res.data;
      });
    },
    //标记我已阅读
    iHaveRead({},params){
      return api.iHaveRead(params).then(function (res) {
        return res.data;
      });
    },
    //编辑文章
    updateArticle({},params){
      return api.updateArticle(params).then(function (res) {
        return res.data;
      });
    },
    //获取文章
    getArticle({},params){
      return api.getArticle(params).then(function (res) {
        return res.data;
      });
    },
    //保存文章
    saveArticle({},params){
      return api.saveArticle(params).then(function (res) {
        return res.data;
      });
    },
    //编辑栏目简介
    updateArticleTopic({},params){
      return api.updateArticleTopic(params).then(function (res) {
        return res.data;
      });
    },
    //获取栏目详情
    getArticleTopic({},params){
      return api.getArticleTopic(params).then(function (res) {
        return res.data;
      });
    },
    //删除栏目
    deleteArticleTopic({},params){
      return api.deleteArticleTopic(params).then(function (res) {
        return res.data;
      });
    },
    //获取栏目列表
    getArticleTopicList({}){
      return api.getArticleTopicList().then(function (res) {
        return res.data;
      });
    },
    //保存栏目
    saveArticleTopic({},params){
      return api.saveArticleTopic(params).then(function (res) {
        return res.data;
      });
    },
    //设置文化栏页面间的传递信息
    setCulture({commit},params){
      commit('SET_CULTURE',params)
    },
    /**
     *
     * @param params
     * @returns {Promise.<TResult>|*}
     */

    //获得我可以查看的人的列表(授权项的那种方式)
    getOptionalWhomICanSeeList({}){
      return api.getOptionalWhomICanSeeList().then(function (res) {
        return res.data;
      })
    },
    //人事获得我能查看的对方详细项
    getWhatKiddaDetailICanSee({},params){
      return api.getWhatKiddaDetailICanSee(params).then(function (res) {
        return res.data;
      })
    },
    //获取请的年假列表
    getSomeoneAnnualLeaveList({},params){
      return api.getSomeoneAnnualLeaveList(params).then(function (res) {
        return res.data;
      })
    },
    //获取某人年假详情
    getSomeoneAnnualLeaveInfo({},params){
      return api.getSomeoneAnnualLeaveInfo(params).then(function (res) {
        return res.data;
      })
    },
    //删除卡片
    removeAuthList({commit,state},params){
      if(typeof params ==='object'){
        return api.deleteOptionalSeeingSettings(params).then(function (res) {
          return res.data;
        })
      }else{
        const payLoad = {
          id:state.authList[params].id
        }
        commit('REMOVE_AUTH_LIST',params);
        return api.deleteOptionalSeeingSettings(payLoad).then(function (res) {
          return res.data;
        })
      }
    },
    setAuthList({commit},params){
      commit('SET_AUTH_LIST',params)
    },
    saveOptionalSeeingSettings({commit},params){
      return api.saveOptionalSeeingSettings(params).then(function (res) {
        return res.data;
      })
    },
    updateOptionalSeeingSettings({commit},params){
      return api.updateOptionalSeeingSettings(params).then(function (res) {
        return res.data;
      })
    },
    getOptionalSeeingSettings(){
      return api.getOptionalSeeingSettings().then(function (res) {
        return res.data;
      })
    },
    setAuthParams({commit},params){
      commit('SET_AUTH_PARAMS',params);
    },
    getAvailableToSetAuthOptions(){
      return api.getAvailableToSetAuthOptions().then(function (res) {
        return res.data;
      })
    },
    getLevelWhomUsingList({commit},params){
      return api.getLevelWhomUsingList(params).then(res =>{
        // if(res.result == 0)
        return res.data;
      })
    },
    get_empType_list({commit}){
      return api.getGradeInfoList().then(res =>{
        commit('SET_EMP_TYPE',res.data.data);
        return res.data;
      })
    },
    set_empLevel({commit},params){
      commit('SET_EMP_LEVEL',params)
    },
    edit_empType({commit},params){
      return api.editGradeOption(params).then(res =>{
        commit('EDIT_EMP_TYPE',params)
        return res.data;
      })
    },
    remove_empType({commit,state},index){
      const type = state.empType[index];
      const data = {
        descId:type.descId
      }
      return api.deleteGradeInfo(data).then(res =>{
          if(res.data.result === 0){
            commit('REMOVE_EMP_TYPE',index);
            return res;
          }
      })
    },
    add_empType({commit},payLoad){
      return api.saveGradeOption(payLoad).then(res => {
        // if (res.data.result === 0) {
          // commit('ADD_EMP_TYPE',payLoad);
          // commit('SET_HR_MANAGER', payLoad.contactIds.split(','))
        // }
        return res.data
      })
    },
    // 获取个人信息
    GET_USER_INFO ({commit}) {
      return api.fetchUserInfo().then(res => {
        commit('SET_USER_INFO', res.data)
        return res
      }).then(res => {
        let hrData = {}
        hrData.companyId = res.data.companyId
        hrData.authType = 41
        // 获取HR管理员
        api.fetchHRAuth(hrData).then(res => {
          commit('IS_HR', res.data)
        })

        let cultureData = {}
        cultureData.companyId = res.data.companyId
        cultureData.authType = 42
        // 获取文化栏管理员
        api.fetchHRAuth(cultureData).then(res => {
          commit('IS_CULTURE_MANAGER', res.data)
        })
      })
    },
    // 获取通讯录
    GET_CONTACTS ({commit}) {
      return api.fetchContacts().then(res => {
        commit('SET_CONTACTS', res.data)
      })
    },
    // 获取部门
    GET_DEPARTMENTS ({commit}) {
      return api.fetchDepartments().then(res => {
        commit('SET_DEPARTMENTS', res.data)
      })
    },
    // 获取HR Manager
    GET_HR_MANAGER ({commit, state}) {
      let hrData = {}
      hrData.companyId = state.userInfo.companyId
      hrData.authType = 41
      return api.fetchHRAuth(hrData).then(res => {
        if (res.data.result === '0') {
          commit('SET_HR_MANAGER', res.data.item)
        }
        return res.data
      })
    },
    // 获取HR设置
    GET_HR_SETTING ({commit}) {
      return api.fetchHRSetting().then(res => {
        if (res.data.result === 0) {
          commit('SET_HR_SETTING', res.data.data)
        }
        return res.data
      })
    },
    // 保存HR管理员
    SAVE_HR_MANAGER ({commit, state}, payLoad) {
      payLoad.authType = 41
      payLoad.companyId = state.userInfo.companyId
      return api.saveHRManager(payLoad).then(res => {
        if (res.data.result === '0') {
          commit('SET_HR_MANAGER', payLoad.contactIds.split(','))
        }
        return res.data
      })
    },
    // 获取Birth设置
    GET_BIRTH_SETTING ({commit}) {
      api.fetchBirthSetting().then(res => {
        if (res.data.result === 0) {
          commit('SET_BIRTH_SETTING', res.data.data)
          commit('SET_BIRTH_REMIND_RANGE', res.data.data)
        }
        return res.data
      })
    },
    // 更新Birth 生日提醒
    SAVE_BIRTH_IS_REMIND ({commit}, payLoad) {
      api.saveBirthIsRemind(payLoad).then(res => {
        if (res.data.result === 0) {
          commit('SET_BIRTH_SETTING', payLoad)
        }
      })
    },
    // 更新Birth 生日提醒内容
    SAVE_BIRTH_REMIND_CONTENT ({commit}, payLoad) {
      api.saveBirthContent(payLoad).then(res => {
        if (res.data.result === 0) {
          commit('SET_BIRTH_SETTING', payLoad)
        }
      })
    },
    // 更新Birth 生日提醒范围
    SAVE_BIRTH_REMIND_RANGE ({commit}, payLoad) {
      api.saveBirthRange(payLoad).then(res => {
        if (res.data.result === 0) {
          commit('SET_BIRTH_REMIND_RANGE', payLoad)
        }
      })
    },
    // 更新Birth 生日提醒人
    SAVE_BIRTH_REMINDER ({commit}, payLoad) {
      api.saveBirthReminder(payLoad).then(res => {
        if (res.data.result === 0) {
          commit('SET_BIRTH_SETTING', payLoad)
        }
      })
    },
    // 获取 员工档案列表
    GET_STAFF_PROFILE ({commit, state}, payLoad) {
      payLoad = {}
      payLoad.isHrManager = state.userInfo.isHRManager
      return api.fetchStaffProfileList(payLoad).then(res => {
        if (res.data.result === 0) {
          commit('SET_STAFF_PROFILE_LIST', res.data)
          return res.data
        }
      })
    },
    // 获取某个员工档案
    GET_PROFILE_DETAIL ({commit}, payLoad) {
      return api.fetchProfileDetailById(payLoad).then(res => {
        if (res.data.result === 0) {
          res.data.data.profileId = payLoad.id
          res.data.data.contactId = payLoad.contactId;
          commit('SET_CURRENT_PROFILE', res.data.data)
          commit('UPDATE_EDIT_CURRENT_PROFILE', res.data.data)
          return res.data.data
        }
      })
    },
    // 更新某个员工档案
    SAVE_PROFILE_DETAIL ({commit}, payLoad) {
      return api.saveProfileDetailById(payLoad).then(res => {
        if (res.data.result === 0) {
          payLoad.profileId = res.data.id
          commit('SET_CURRENT_PROFILE', payLoad)
        }
        return res.data
      })
    },
    // 获取能查看的员工档案列表
    GET_ALLOWED_PROFILE_LIST () {
      return api.fetchAllowedProfileList().then(res => {
        return res.data
      })
    },
    // 获取我的申请列表
    GET_ALREADY_APPLIED_LIST () {
      return api.fetchAlreadyAppliedList().then(res => {
        return res.data
      })
    },
    // 申请查看某个人档案
    APPLY_FOR_PROFILE_DETAIL ({}, payload) {
      return api.fetchApplyForProfileDetail(payload).then(res => {
          return res.data
      })
    },
    // 获取我个人信息档案
    GET_MY_PROFILE ({commit},payload) {
      return api.fetchMyProfile().then(res => {
        res.data.data.profileId = res.data.data.id
        res.data.data.contactId = payload.contactId;
        commit('SET_CURRENT_PROFILE', res.data.data)
        commit('UPDATE_EDIT_CURRENT_PROFILE', res.data.data)
        return res.data.data
      })
    },
    // 申请查看某个人档案
    GET_APPLICATION_LIST ({commit, state}) {
      let params = {}
      params.isHrManager = state.userInfo.isHRManager
      return api.fetchApplicationList(params).then(res => {
        if (res.data.result === 0) {
          commit('SET_APPLICATION_LIST', res.data.data)
        }
        return res.data
      })
    },
    // 批准某个申请
    APPROVE_APPLICATION ({state}, payload) {
      payload.isHrManager = state.userInfo.isHRManager
      return api.fetchApproveApplication(payload).then(res => {
        return res.data
      })
    },
    // 判断某人是否有查看审批权限
    getRequestDetail ({}, payload) {
      return api.getRequestDetail(payload).then(res => {
        return res.data
      })
    },
    // 批准某个申请
    GET_HR_HISTORY ({}, payload) {
      return api.fetchHRHistory(payload).then(res => {
        return res.data
      })
    },
    // 加密字段
    ENCODE_DATA ({}, payload) {
      return api.fetchEncodeData(payload).then(res => {
        return res.data
      })
    },
    // 解密字段
    DECODE_DATA ({commit}, payload) {
      let encodeData = []
      var encodeList = [];
      if (payload.probationaryPeriodSalary !== undefined && payload.probationaryPeriodSalary !== "") {
        encodeData.push(payload.probationaryPeriodSalary)
        encodeList.push(1)
      }
      if (payload.probationaryKPISalary !== undefined && payload.probationaryKPISalary !== "") {
        encodeData.push(payload.probationaryKPISalary)
        encodeList.push(2)
      }
      if (payload.regularSalary !== undefined && payload.regularSalary !== "") {
        encodeData.push(payload.regularSalary)
        encodeList.push(3)
      }
      if (payload.regularKPISalary !== undefined && payload.regularKPISalary !== "") {
        encodeData.push(payload.regularKPISalary)
        encodeList.push(4)
      }
      return api.fetchDecodeData(encodeData).then(res => {
        if (res.data.respCode === '000') {
          if (res.data.item.length > 0) {
            var index = 0;
            encodeList.forEach(function (n) {
              if(n===1){
                payload.probationaryPeriodSalary = res.data.item[index];
                index++
              }else if(n === 2){
                payload.probationaryKPISalary = res.data.item[index];
                index++
              }else if(n ===3){
                payload.regularSalary = res.data.item[index];
                index++
              }else if(n ===4){
                payload.regularKPISalary = res.data.item[index];
                index++
              }
            })
            commit('SET_CURRENT_PROFILE', payload);
            commit('UPDATE_EDIT_CURRENT_PROFILE', payload)
          }
        }
        return res.data
      })
    },
    // 查看更新记录中解密字段
    DECODE_DATA_UPDATE_RECORD({},params){
      return api.fetchDecodeData(params).then(res => {
        return res.data
      })
    },
    setEditCurrentProfile({commit},params){
      commit('SET_EDIT_CURRENT_PROFILE',params)
      return ''
    },
    setEmpNumber({commit},params){
      commit('SET_EMP_NUMBER',params)
    }
  }
})
