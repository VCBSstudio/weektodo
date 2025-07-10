import axios from 'axios';
import storageRepository from './storageRepository.js';

export default {
  // 发起GitHub登录
  async githubLogin() {
    // window.location.href = `${AUTH_ENDPOINT}/github`;
   const client_id = process.env.VUE_APP_GITHUB_CLIENT_ID;
    const redirect_uri = process.env.VUE_APP_REDIRECT_URI || window.location.origin;
    const scope = 'read:user user:email';
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}`;
      window.location.href = url;
  },

  // 发起微信登录
  async wechatLogin() {

  },

  // 发起Google登录
  async googleLogin() {

  },

  // 处理登录回调
  async handleCallback(code) {
    console.log("lt -- get code:" + code)
    const response = await axios.get(`http://localhost:3000/api/auth/github/callback/callback?code=${code}`);
    console.log("lt -- response : " + response)
    storageRepository.saveToken(response.data.token);
    storageRepository.saveUser(response.data.user);
    return response.data.user;
  },

  // 登出
  logout() {
    storageRepository.removeToken();
    storageRepository.removeUser();
  },

  // 获取当前用户
  getCurrentUser() {
    return storageRepository.getUser();
  }
};