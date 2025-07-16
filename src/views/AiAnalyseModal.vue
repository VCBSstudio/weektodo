<template>
  <div class="modal fade" id="AiAnalyseModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered ai-analyse-modal">
      <div class="modal-content">
        <div class="modal-header compact-header">
          <h5 class="modal-title">{{ $t('ui.aiAnalyse') }}</h5>
          <i class="bi-x close-modal" data-bs-dismiss="modal"></i>
        </div>
        <div class="modal-body compact-body">
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
            {{ $t('ui.noTasks') }}
          </div>
        </div>
        <!-- 添加底部按钮 -->
        <div class="modal-footer compact-footer">
          <button type="button" class="btn btn-sm btn-primary">AI分析</button>
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
  computed: {
    todoLists() {
      return this.$store.getters.todoLists;
    },
    filteredTaskDates() {
      return Object.keys(this.todoLists).filter(key => {
        return /^\d{8}$/.test(key) &&
          this.todoLists[key].length > 0;
      }).sort().reverse();
    }
  },
  methods: {
    formatDate(dateStr) {
      if (dateStr.length !== 8) return dateStr;
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
  }
}
</script>

<style scoped>
/* 弹窗尺寸控制 */
.ai-analyse-modal {
  min-width: 600px;
  max-width: 1000px;
}

/* 紧凑布局样式 */
.compact-header {
  padding: 0.5rem 1rem;
}
.compact-body {
  font-size: 0.9rem;
  padding: 0.8rem;
}
.compact-footer {
  padding: 0.7rem 1rem;
  border-top: 1px solid #dee2e6;
}

.dates-container {
  min-height: 300px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 5px;
}

.date-section {
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
}

.date-section:last-child {
  border-bottom: none;
}

.date-header {
  color: #5e6ef2;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.task-list {
  padding-left: 0;
  margin-bottom: 0;
}

.task-item {
  padding: 0.4rem 0.6rem;
  background-color: #f8f9fa;
  border-radius: 3px;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
}

.task-text {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.87rem;
}

.subtask-indicator {
  font-size: 0.75rem;
  color: #6c757d;
  margin-left: 6px;
  white-space: nowrap;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-size: 0.9rem;
}

/* 按钮样式 */
.btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}
</style>