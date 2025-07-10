<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <button class="login-btn github-btn" @click="$emit('github')">
          <i class="bi-github"></i>
          <span>{{ $t('login.Github') }}</span>
        </button>
        <button class="login-btn wechat-btn" @click="$emit('wechat')">
          <i class="bi-wechat"></i>
          <span>{{ $t('login.Wechat') }}</span>
        </button>
        <button class="login-btn google-btn" @click="$emit('google')">
          <i class="bi-google"></i>
          <span>{{ $t('login.Google') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, required: true }
  },
  methods: {
    closeModal() {
      this.$emit('update:modelValue', false);
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;  /* 新增：在小屏幕上使用百分比宽度 */
  max-width: 400px;  /* 新增：设置最大宽度 */
  min-width: auto;  /* 修改：移除固定最小宽度 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative; /* 新增：为关闭按钮定位提供参考 */
}

.modal-header h3 {
  margin: 0 auto; /* 修改：使标题水平居中 */
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  position: absolute; /* 新增：绝对定位 */
  top: 0; /* 新增：定位到顶部 */
  right: 0; /* 新增：定位到右侧 */
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-btn:active {
  transform: translateY(0);
}

.github-btn {
  background-color: #24292e;
  color: white;
}

.wechat-btn {
  background-color: #07c160;
  color: white;
}

.google-btn {
  background-color: #4285f4;
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>