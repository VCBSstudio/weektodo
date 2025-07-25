<template>
  <div class="modal fade" id="AiAnalyseModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered ai-analyse-modal">
      <div class="modal-content">
        <div class="modal-header compact-header">
          <h5 class="modal-title">AI分析总结</h5>
          <i class="bi-x close-modal" data-bs-dismiss="modal"></i>
        </div>
        <div class="modal-body compact-body">
          <!-- 分析结果展示区 (仅在有结果或正在分析时显示) -->
          <div v-if="analysisResult || isAnalyzing" class="analysis-container">
            <div class="result-display">
              <div class="result-header">
                <h6>AI分析结果</h6>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetAnalysis"
                  :disabled="isAnalyzing"
                >
                  重新分析
                </button>
              </div>
              <div class="result-content">
                <!-- 显示分析结果 -->
                {{ analysisResult }}
                <!-- 当正在分析时，显示一个闪烁的光标，提供视觉反馈 -->
                <span v-if="isAnalyzing" class="blinking-cursor"></span>
                <!-- 如果分析开始但还没有任何结果，显示加载提示 -->
                <div v-if="isAnalyzing && !analysisResult" class="loading-indicator">
                  <div class="spinner-border spinner-border-sm" role="status"></div>
                  <span>AI分析中，请稍候...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 原始任务数据展示 (默认显示状态) -->
          <div v-else>
            <!-- 有任务的日期列表 -->
            <div v-if="filteredTaskDates.length > 0" class="dates-container">
              <div v-for="date in filteredTaskDates" :key="date" class="date-section">
                <h6 class="date-header">{{ formatDate(date) }}</h6>
                <ul class="task-list">
                  <li v-for="(task, index) in todoLists[date]" :key="index" class="task-item">
                    <span class="task-text">{{ task.text }}</span>
                    <span v-if="task.subTaskList.length > 0" class="subtask-indicator">
                      ({{ task.subTaskList.length }})
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <!-- 没有数据的提示 -->
            <div v-else class="no-data">
              没有可供分析的任务数据
            </div>
          </div>
        </div>

        <div class="modal-footer compact-footer">
          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="startAnalysis"
            :disabled="isAnalyzing || filteredTaskDates.length === 0"
          >
            {{ isAnalyzing ? '分析中...' : 'AI分析' }}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            data-bs-dismiss="modal"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 1. 导入我们创建的 API 服务
import { fetchAIAnalysisStream } from '@/services/aiAnalysisService.js';

export default {
  name: 'AiAnalyseModal',
  props: {
    datesArray: {
      type: Array,
      default: () => []
    },
    weekTasks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isAnalyzing: false,
      analysisResult: '',
      errorMessage: '',
      abortController: null,
    };
  },
  computed: {
    // 从 Vuex store 获取任务列表
    todoLists() {
      // 确保在 store 不可用时不会报错
      return this.$store?.getters?.todoLists || {};
    },
    // 过滤出有任务的日期
    filteredTaskDates() {
      return Object.keys(this.todoLists).filter(key => {
        return /^\d{8}$/.test(key) &&
          this.todoLists[key] &&
          this.todoLists[key].length > 0;
      }).sort().reverse();
    }
  },
  mounted() {
    const modalEl = document.getElementById('AiAnalyseModal');
    if (modalEl) {
      // 监听 Bootstrap 模态框的 'show.bs.modal' 事件
      // 这个事件在模态框开始显示时触发，我们用它来重置状态
      modalEl.addEventListener('show.bs.modal', this.resetAllState);
    }
  },
  beforeUnmount() {
    const modalEl = document.getElementById('AiAnalyseModal');
    if (modalEl) {
      // 组件销毁前移除事件监听，防止内存泄漏
      modalEl.removeEventListener('show.bs.modal', this.resetAllState);
    }
    // 确保组件卸载时取消任何正在进行的请求
    this.cancelAnalysis();
  },
  methods: {
    // 格式化日期字符串
    formatDate(dateStr) {
      if (dateStr.length !== 8) return dateStr;
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    },

    // 准备要发送给AI的任务数据文本
    prepareTaskData() {
      let taskData = '';
      this.filteredTaskDates.forEach(date => {
        taskData += `日期: ${this.formatDate(date)}\n`;
        this.todoLists[date].forEach(task => {
          taskData += `- ${task.text}`;
          if (task.subTaskList.length > 0) {
            taskData += ` (包含${task.subTaskList.length}个子任务)`;
          }
          taskData += '\n';
        });
        taskData += '\n';
      });
      return taskData;
    },

    // 完整的状态重置方法
    resetAllState() {
      this.cancelAnalysis(); // 如果有正在进行的分析，取消它
      this.analysisResult = '';
      this.errorMessage = '';
      this.isAnalyzing = false; // 确保加载状态也被重置
    },

    // 开始分析
    async startAnalysis() {
      if (this.isAnalyzing) return; // 防止重复点击

      this.isAnalyzing = true;
      this.analysisResult = '';
      this.errorMessage = '';
      this.abortController = new AbortController();

      // 根据API文档构建请求体
      const requestPayload = {
        content_type: 2002,
        user_id: "9421960074", // 注意：在实际应用中，这应该是动态的当前用户ID
        dialog_id: 0,
        template_id: 0,
        ref_file_id: "",
        search_enabled: false,
        think_enable: true,
        uuid: crypto.randomUUID(), // 为每次请求生成一个新的UUID
        prompt: `请基于以下任务列表，对我的工作模式进行分析总结，并提出优化建议：\n\n${this.prepareTaskData()}`
      };

      try {
        const handleChunk = (textChunk) => {
          this.analysisResult += textChunk;
        };

        // 调用服务函数，并等待它完成（即接收到 'Done' 信号）
        await fetchAIAnalysisStream(
          requestPayload,
          handleChunk,
          this.abortController.signal
        );

      } catch (error) {
        // AbortError 由 cancelAnalysis 处理，这里只处理其他错误
        if (error.name !== 'AbortError') {
          this.errorMessage = `分析出错: ${error.message}`;
          this.analysisResult = `抱歉，分析过程中遇到问题：${error.message}`;
        }
      } finally {
        // 无论成功、失败还是取消，最后都将分析状态设置为 false
        this.isAnalyzing = false;
        this.abortController = null;
      }
    },

    // 重新分析
    resetAnalysis() {
      // 先调用完整的状态重置方法
      this.resetAllState();
      // 使用 $nextTick 确保DOM更新后再开始新的分析
      this.$nextTick(() => {
        this.startAnalysis();
      });
    },

    // 取消分析
    cancelAnalysis() {
      if (this.abortController) {
        this.abortController.abort(); // 中止 fetch 请求
        this.abortController = null;
      }
      // 不在此处直接更新UI，由 finally 块统一处理
    }
  }
}
</script>

<style scoped>
/* 为了更好的视觉效果，添加一个打字光标 */
.blinking-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em; /* 匹配字体大小 */
  background-color: #333;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
  margin-left: 2px;
}

@keyframes blink {
  from, to { background-color: transparent }
  50% { background-color: #333; }
}

/* 分析相关的样式 */
.analysis-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  justify-content: flex-start; /* 改为左对齐 */
}

.result-display {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.result-content {
  flex-grow: 1;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  overflow-y: auto;
  white-space: pre-wrap; /* 保持换行和空格 */
  line-height: 1.6;
  min-height: 200px; /* 增加最小高度 */
}

.modal-body.compact-body {
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
}
.dates-container, .no-data {
  /* 这些是你原有的样式，如果需要可以放在这里 */
}
</style>