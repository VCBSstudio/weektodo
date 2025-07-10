<script>
import { onMounted } from 'vue';
import authRepository from '../repositories/authRepository.js';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    onMounted(async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        try {
          await authRepository.handleCallback(code);
          router.push('/');
          window.opener?.location.reload();
          window.close();
        } catch (error) {
          alert('登录失败，请重试');
          router.push('/login');
        }
      }
    });
  }
}
</script>