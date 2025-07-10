

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// 处理浏览器访问 GET 回调接口（调试友好）
app.get('/api/auth/github/callback', async (req, res) => {
  const { code } = req.query; // ✅ 使用 query 解析 GET 参数

  if (!code) {
    return res.status(400).json({ error: 'Missing code in query' });
  }

  try {
    // 换取 access_token
    const tokenRes = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      {
        headers: {
          accept: 'application/json',
        },
      }
    );

    const access_token = tokenRes.data.access_token;

    // 获取用户信息
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        accept: 'application/json',
      },
    });

    // 返回数据
    res.json({
      token: access_token,
      user: userRes.data,
    });
  } catch (err) {
    console.error('GitHub Auth Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'GitHub Auth Failed' });
  }
});

app.listen(3000, () => {
  console.log('✅ Auth server running on http://localhost:3000');
});
