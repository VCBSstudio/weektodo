import axios from 'axios';
import storageRepository from './storageRepository.js';

export default {
  // 发起GitHub登录
  async githubLogin() {
    // window.location.href = `${AUTH_ENDPOINT}/github`;
   const client_id = process.env.VUE_APP_GITHUB_CLIENT_ID;
    const redirect_uri = process.env.VUE_APP_REDIRECT_URI || window.location.origin;
    const scope = 'profile email';
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}`;
      window.location.href = url;
  },

  // 发起微信登录
  async wechatLogin() {

  },

  async googleLogin() {
    const client_id = process.env.VUE_APP_GOOGLE_CLIENT_ID;
    const redirect_uri = process.env.VUE_APP_GOOGLE_REDIRECT_URI || window.location.origin;
    const scope = ['openid', 'profile', 'email'].join(' ');
    const response_type = 'code';

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}` +
                `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                `&response_type=${response_type}` +
                `&scope=${encodeURIComponent(scope)}`;
    console.log("lt -- url : " + url)
    window.location.href = url;
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