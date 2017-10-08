import axios from 'axios'
import {getUrlParam} from '../libs/utils'
// 获取token
const token = getUrlParam('token')
// const baseUrl = 'https://www.erplus.co/mphr'
// 设置全局携带
axios.defaults.baseURL = 'https://www.erplus.co'
axios.defaults.headers.common = {
  'Authorization': 'Bearer ' + token
}

export default {

  updateArticleReadRange:function (data) {
    return axios.post('/mphr/updateArticleReadRange',data)
  },
  getReadArticlePeople:function (data) {
    return axios.post('/mphr/getReadArticlePeople',data)
  },
  getArticleRange:function (data) {
    return axios.post('/mphr/getArticleRange',data)
  },
  isAlreadyExistSerialNum:function (data) {
    return axios.post('/mphr/isAlreadyExistSerialNum',data)
  },
  signIn:function (data) {
    return axios.get('/oauth/v2/token?grant_type=password&webflag=1&client_id=2_3t7k61w8zz28wc00w0o0swgo0ko48w08c8csk4ss444os4ccgo&client_secret=6o596th97340soswgw8ssswk8gk8cwoo40c4wwccs4g4wswk8&username='+data.username+'&password='+data.password+'%23%23%23PC')
  },
  getSerialNumberPlanNextNumber:function (data) {
    return axios.post('/mphr/getSerialNumberPlanNextNumber',data)
  },
  deleteSerialNumberPlan:function (data) {
    return axios.post('/mphr/deleteSerialNumberPlan',data)
  },
  editSerialNumberPlan:function (data) {
    return axios.post('/mphr/editSerialNumberPlan',data)
  },
  getSerialNumberPlanDetail:function (data) {
    return axios.post('/mphr/getSerialNumberPlanDetail',data)
  },
  getSerialNumberPlans:function () {
    return axios.post('/mphr/getSerialNumberPlans')
  },
  addSerialNumberPlan:function (data) {
    return axios.post('/mphr/addSerialNumberPlan',data)
  },
  getStaffStatusList:function () {
    return axios.post('/mphr/getStaffStatusList')
  },
  saveStaffStatu:function (data) {
    return axios.post('/mphr/saveStaffStatu',data)
  },
  getRedPoint:function (data) {
    return axios.post('/mphr/getRedPoint',data)
  },
  /**
   * 文化栏接口
   * @param data
   * @returns {*}
   */

  topicRedpoint:function (data) {
    return axios.post('/mphr/topicRedpoint',data)
  },
  deleteArticle:function (data) {
    return axios.post('/mphr/deleteArticle',data)
  },
  searchArticle:function (data) {
    return axios.post('/mphr/searchArticle',data)
  },
  iHaveRead:function (data) {
    return axios.post('/mphr/iHaveRead',data)
  },
  updateArticle:function (data) {
    return axios.post('/mphr/updateArticle',data)
  },
  getArticle:function (data) {
    return axios.post('/mphr/getArticle',data)
  },
  saveArticle:function (data) {
    return axios.post('/mphr/saveArticle',data)
  },
  updateArticleTopic:function (data) {
    return axios.post('/mphr/updateArticleTopic',data)
  },
  getArticleTopic:function (data) {
    return axios.post('/mphr/getArticleTopic',data)
  },
  deleteArticleTopic:function (data) {
    return axios.post('/mphr/deleteArticleTopic',data)
  },
  getArticleTopicList:function () {
    return axios.get('/mphr/getArticleTopicList')
  },
  saveArticleTopic:function (data) {
    return axios.post('/mphr/saveArticleTopic',data)
  },
  //文化栏结束

  getRequestDetail:function (data) {
    return axios.post('/appreq/getRequestDetail',data)
  },
  getOptionalWhomICanSeeList:function () {
    return axios.post('/mphr/getOptionalWhomICanSeeList')
  },
  getWhatKiddaDetailICanSee:function (data) {
    return axios.post('/mphr/getWhatKiddaDetailICanSee',data)
  },
  getSomeoneAnnualLeaveList:function (data) {
    return axios.post('https://www.managerplus.cn/appreq/getSomeoneAnnualLeaveList',data)
  },
  getSomeoneAnnualLeaveInfo:function (data) {
    return axios.post('/mphr/getSomeoneAnnualLeaveInfo',data)
  },
  updateOptionalSeeingSettings:function (data) {
    return axios.post('/mphr/updateOptionalSeeingSettings',data)
  },
  deleteOptionalSeeingSettings:function (data) {
    return axios.post('/mphr/deleteOptionalSeeingSettings',data)
  },
  getOptionalSeeingSettings:function () {
    return axios.post('/mphr/getOptionalSeeingSettings')
  },
  saveOptionalSeeingSettings:function (data) {
    return axios.post('/mphr/saveOptionalSeeingSettings',data)
  },
  getAvailableToSetAuthOptions:function () {
    return axios.post('/mphr/getAvailableToSetAuthOptions')
  },
  getLevelWhomUsingList:function (data) {
    return axios.post('/mphr/getLevelWhomUsingList',data)
  },
  getGradeInfoList:function () {
    return axios.post('/mphr/getGradeInfoList')
  },
  saveGradeOption:function (data) {
    return axios.post('/mphr/saveGradeOption',data)
  },
  deleteGradeInfo:function (data) {
    return axios.post('/mphr/deleteGradeInfo',data)
  },
  editGradeOption:function (data) {
    return axios.post('/mphr/editGradeOption',data)
  },
  fetchUserInfo: function () {
    return axios.get('/api/v1/profile')
  },
  fetchHRAuth: function (data) {
    return axios.post('/mpauth/getContactidsByAuthType', data)
  },
  fetchContacts: function () {
    return axios.get('/api/v1/contacts')
  },
  fetchDepartments: function () {
    return axios.get('/api/v1/departments')
  },
  fetchHRSetting: function () {
    return axios.post('/mphr/getHrOption')
  },
  saveHRManager: function (data) {
    return axios.post('/mpauth/insertAuth', data)
  },
  fetchBirthSetting: function () {
    return axios.post('/mphr/getBirthdayOption')
  },
  saveBirthIsRemind: function (data) {
    return axios.post('/mphr/birthdayRemindSwitch', data)
  },
  saveBirthContent: function (data) {
    return axios.post('/mphr/saveBirthdayRemindContext', data)
  },
  saveBirthRange: function (data) {
    return axios.post('/mphr/saveBirthdayRemindRange', data)
  },
  saveBirthReminder: function (data) {
    return axios.post('/mphr/saveWhoNeedsBirthdayRemind', data)
  },
  fetchStaffProfileList: function (data) {
    return axios.post('/mphr/getBasicHrInfoList', data)
  },
  fetchProfileDetailById: function (data) {
    return axios.post('/mphr/getBasicHrInfoDetail', data)
  },
  saveProfileDetailById: function (data) {
    return axios.post('/mphr/saveBasicHrInfo', data)
  },
  fetchAllowedProfileList: function () {
    return axios.post('/mphr/getWhoAuthToSeeList')
  },
  fetchApplyForProfileDetail: function (data) {
    return axios.post('/mphr/applyForCheckingBasicHrInfo', data)
  },
  fetchApplicationList: function (data) {
    return axios.post('/mphr/getApplicationList', data)
  },
  fetchAlreadyAppliedList: function (data) {
    return axios.post('/mphr/getWhoIAlreadyAppliedList', data)
  },
  fetchApproveApplication: function (data) {
    return axios.post('/mphr/handleBasicHrInfoApplication', data)
  },
  fetchMyProfile: function () {
    return axios.post('/mphr/getMyBasicHrInfo')
  },
  fetchHRHistory: function (data) {
    return axios.post('/mphr/getHrHistoryInfo', data)
  },
  fetchEncodeData: function (data) {
    return axios.post('/salaryServlet/encodeData', data)
  },
  fetchDecodeData: function (data) {
    return axios.post('/salaryServlet/decodeData', data)
  }
}
