<template>
  <input class="hidden-input-for-focus" type="text" />
  <div v-show="compatible" id="app-container" class="app-container" :class="{ 'dark-theme': darkTheme }">
    <div class="hidden-mobile app-body" :style="{ zoom: `${zoom}%` }">
      <splash-screen ref="splash"></splash-screen>
      <side-bar @change-date="setSelectedDate"></side-bar>

      <div class="h-100 d-flex flex-column">
        <div v-show="showCalendar" class="todo-lists-container" :style="resizableStyle" ref="calendarContainer" :class="{
          'full-screen': !showCustomList,
          'hidden-lists-container': hideTopListContainer,
          'full-screen-divider': hideBottomListContainer,
        }">
          <i class="bi-chevron-left slider-btn" ref="weekLeft" @click="weekMoveLeft"></i>
          <div class="todo-slider weekdays" ref="weekListContainer">
            <to-do-list v-for="date in dates_array" :key="date" :id="date" :showCustomList="showCustomList"
              @todo-list-mounted="todoListMounted">
            </to-do-list>
          </div>
          <i class="bi-chevron-right slider-btn" ref="weekRight" @click="weekMoveRight"></i>
        </div>

        <div v-show="showCustomList && showCalendar" class="main-horizontal-divider" id="resizer"
          :class="mainDividerPositionClass" @mousedown="resizerMouseDownHandler" @dblclick="resizerDblClick">
          <div class="inner-main-horizontal-divider"></div>
          <div class="divider-icons-container">
            <i class="bi-chevron-up move-to-center-up divider-icons" @click="setDividerPosition(1)"
              :title="$t('ui.restorePanel')"></i>
            <i class="bi-chevron-up move-to-corner-up divider-icons" @click="setDividerPosition(2)"
              :title="$t('ui.maximizeListPanel')"></i>
            <i class="bi-chevron-down move-to-center-down divider-icons" @click="setDividerPosition(1)"
              :title="$t('ui.restorePanel')"></i>
            <i class="bi-chevron-down move-to-corner-down divider-icons" @click="setDividerPosition(0)"
              :title="$t('ui.maximizeCalendarPanel')"></i>
          </div>
        </div>

        <div v-show="showCustomList" class="todo-lists-container" :class="{
          'full-screen': !showCalendar,
          'flex-grow-1': showCalendar,
          'hidden-lists-container': hideBottomListContainer,
        }">
          <i class="bi-chevron-left slider-btn" @click="customMoveLeft" :style="{
            visibility: cTodoList.length > customColumns ? 'visible' : 'hidden',
          }"></i>
          <div class="todo-slider slides" ref="customListContainer">
            <to-do-list v-for="(cTodoList, index) in cTodoList" :key="cTodoList.listId" :id="cTodoList.listId"
              :customTodoList="true" :cTodoListIndex="index" :showCustomList="showCustomList"
              @todo-list-mounted="todoListMounted"></to-do-list>
          </div>
          <i class="bi-chevron-right slider-btn" @click="customMoveRight" :style="{
            visibility: cTodoList.length > customColumns ? 'visible' : 'hidden',
          }"></i>
        </div>

        <div v-show="!showCustomList && !showCalendar" style="margin: auto">
          <img v-if="darkTheme" src="img/WeekToDoDarkLogo.webp" />
          <img v-else src="img/WeekToDoLightLogo.webp" />
        </div>
      </div>

      <remove-custom-list></remove-custom-list>
      <config-modal @change-columns="weekResetScroll" :configProp="$store.getters.config"></config-modal>
      <clear-data-modal></clear-data-modal>
      <clear-list-modal></clear-list-modal>
      <about-modal></about-modal>
      <donate-modal></donate-modal>
      <welcome-modal></welcome-modal>
      <tips-modal></tips-modal>
      <to-do-modal :selectedTodo="selectedTodo"></to-do-modal>
      <active-to-do :activeTodo="activeTodo"> </active-to-do>
      <recurrent-events-modal></recurrent-events-modal>
      <importing-modal :id="'importingModal'" :text="$t('settings.importing')"></importing-modal>
      <importing-modal :id="'exportingModal'" :text="$t('settings.exporting')"></importing-modal>

      <reorder-custom-lists-modal @reset-custom-list="resetCustomList"></reorder-custom-lists-modal>
      <!--ai 分析-->
      <AiAnalyseModal
        :datesArray="dates_array"
        :weekTasks="weekTasks"
        @reset-custom-list="resetCustomList"
      ></AiAnalyseModal>
    </div>
    <div class="mobile d-flex flex-column justify-content-center align-items-center">
      <i class="bi-exclamation-diamond mb-4" style="font-size: 100px"></i>
      <h3 style="text-align: center">{{ $t("ui.mobileWarning") }}</h3>
    </div>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1056">
      <toast-message id="versionChanges" :text="$t('ui.softwareUpdated')" :sub-text="$t('ui.seeChanges')"
        @subTextClick="seeChangeLog"></toast-message>

      <toast-message id="newVersionAvailable" :text="$t('ui.newVersionAvailable')" :sub-text="$t('ui.download')"
        @subTextClick="downloadNewVersion"></toast-message>

      <toast-message id="copiedAddress" :text="$t('donate.copiedAddres')"></toast-message>
    </div>
  </div>
  <div v-if="!compatible" class="compatible d-flex flex-column justify-content-center align-items-center p-5">
    <i class="bi-exclamation-diamond mb-4" style="font-size: 100px"></i>
    <h3 style="text-align: center">{{ $t("ui.compatible") }}</h3>
  </div>
</template>

<script>
import toDoList from "./components/toDoList";
import moment from "moment";
import sideBar from "./components/layout/sideBar";
import customToDoListIdsRepository from "./repositories/customToDoListIdsRepository";
import removeCustomList from "./components/comfirmModals/removeCustomList";
import configModal from "./views/configModal";
import splashScreen from "./components/splashScreen";
import configRepository from "./repositories/configRepository";
import aboutModal from "./views/aboutModal";
import donateModal from "./views/donateModal";
import welcomeModal from "./views/welcomeModal";
import toDoModal from "./views/toDoModal/toDoModal";
import tipsModal from "./views/tipsModal";
import { Modal, Toast } from "bootstrap";
import migrations from "./migrations/migrations";
import version_json from "../public/version.json";
import isElectron from "is-electron";
import taskHelper from "./helpers/tasksHelper";
import notifications from "./helpers/notifications";
import clearDataModal from "./components/comfirmModals/clearDataModal.vue";
import clearListModal from "./components/comfirmModals/clearListModal.vue";
import importingModal from "./views/importingModal.vue";
import RecurrentEventsModal from "./views/RecurrentEventsModal.vue";
import repeatingEventRepository from "./repositories/repeatingEventRepository";
import toDoListRepository from "./repositories/toDoListRepository";
import ReorderCustomListsModal from "./views/ReorderCustomListsModal.vue";
import AiAnalyseModal from "./views/AiAnalyseModal.vue"; // ai分析
import toastMessage from "./components/toastMessage";
import activeToDo from "./components/activeToDo.vue";
import tasksHelper from "./helpers/tasksHelper";
import authRepository from "./repositories/authRepository";

export default {
  name: "App",
  components: {
    donateModal,
    configModal,
    toDoList,
    sideBar,
    removeCustomList,
    splashScreen,
    aboutModal,
    welcomeModal,
    tipsModal,
    toDoModal,
    clearDataModal,
    RecurrentEventsModal,
    importingModal,
    ReorderCustomListsModal,
    AiAnalyseModal,
    clearListModal,
    toastMessage,
    activeToDo,
  },
  data() {
    return {
      selected_date: null,
      cTodoList: this.$store.getters.cTodoListIds,
      calendarHeight: "calc(50% - 50px)",
      ipcRenderer: null,
      initialLoadCompleted: false,
      initialListToLoad: 0,
      initialListLoaded: 0,
    };
  },
  beforeCreate() {
    let config = configRepository.load();
    if (version_json.version != config.version) {
      migrations.migrate();
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    this.$store.commit("loadCustomTodoListsIds", customToDoListIdsRepository.load());
    this.$store.commit("loadConfig", configRepository.load());
    this.$i18n.locale = this.$store.getters.config.language;

    this.$store.dispatch("loadAllRepeatingEvent").then(
      function () {
        let totalDaysCount = parseInt(this.$store.getters.config.columns) + 2;
        let totalCustomListCount = this.$store.getters.cTodoListIds.length;
        this.initialListToLoad = totalDaysCount + totalCustomListCount;
        this.deleteOldRepeatingEvents();
        this.selected_date = moment().format("YYYYMMDD");
        this.$nextTick(() => {
          this.weekResetScroll();
        });
        this.$store.commit("loadRepeatingEventDateCache", this.$store.getters.repeatingEventList);
      }.bind(this)
    );
  },
  async mounted() {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    console.log("lt -- code : " + code)

    if (code) {
      try {
        const axios = require("axios").default;
          console.log('lt -- 開始請求 : ');
        const res = await axios.get(`http://localhost:3000/api/auth/github/callback?code=${code}`);
        console.log('lt -- res : ' + JSON.stringify(res));
          alert('lt -- 登录成功' + res);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));        // 清除 URL 中的 code 参数
        window.history.replaceState(null, '', '/');

        // 可选：跳转到用户主页或刷新当前页面
        // location.reload();
      } catch (e) {
        alert('lt -- 登录失败');
        console.error(e);
      }
    }

    this.$refs.weekListContainer.scrollLeft = this.todoListWidth();
    this.calendarHeight = this.$store.getters.config.calendarHeight;
    window.addEventListener("resize", this.weekResetScroll);
    document.onreadystatechange = () => {
      if (document.readyState == "complete") {
        setTimeout(this.hideSplash, 4500);
      }
    };

    if (isElectron()) {
      const { ipcRenderer } = require("electron");
      this.ipcRenderer = ipcRenderer;
      if (this.$store.getters.config.firstTimeOpen) this.ipcRenderer.send("show-current-window");
      this.ipcRenderer.send("match-open-on-startup", this.$store.getters.config.openOnStartup);
    }

    if (this.$store.getters.config.importing) {
      this.$store.commit("updateConfig", { val: false, key: "importing" });
      configRepository.update(this.$store.getters.config);
      if (isElectron()) {
        this.syncElectronConfig();
      }
    }

    this.resetAppOnDayChange();
  },
  beforeUnmount() {
    // 移除事件监听，避免内存泄漏
    window.removeEventListener('popstate', this.handleAuthCallback);
    window.removeEventListener('hashchange', this.handleAuthCallback);
  },
  methods: {
    async handleAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        try {
          // 调用后端接口处理授权码
          await authRepository.handleCallback(code);
          // 清除URL中的code参数，避免刷新页面重复处理
          window.history.replaceState({}, document.title, window.location.pathname);
          // 刷新用户数据或显示登录成功消息
          this.$store.dispatch('fetchUserData');
          this.$toast.success('登录成功');
        } catch (error) {
          console.error('登录失败:', error);
          this.$toast.error('登录失败，请重试');
        }
      }
    },
    weekMoveLeft: function () {
      this.selected_date = moment(this.selected_date).subtract(1, "d").format("YYYYMMDD");
      this.$refs.weekListContainer.scrollLeft = this.todoListWidth() * 2;
      this.$refs.weekListContainer.scroll({
        left: this.$refs.weekListContainer.scrollLeft - this.todoListWidth(),
        top: 0,
        behavior: "smooth",
      });
    },
    weekMoveRight: function () {
      this.selected_date = moment(this.selected_date).add(1, "d").format("YYYYMMDD");
      this.$refs.weekListContainer.scrollLeft = 0;
      this.$refs.weekListContainer.scroll({
        left: this.$refs.weekListContainer.scrollLeft + this.todoListWidth(),
        top: 0,
        behavior: "smooth",
      });
    },
    deleteOldRepeatingEvents: function () {
      for (const event of Object.entries(this.$store.getters.repeatingEventList)) {
        if (moment(event[1].end_date).isBefore(moment())) {
          repeatingEventRepository.remove(event[0]);
          this.$store.commit("removeRepeatingEvent", event[0]);
        }
      }
    },
    weekResetScroll: function () {
      this.$refs.weekListContainer.scrollLeft = this.todoListWidth();
    },
    customMoveRight: function () {
      this.$refs.customListContainer.scrollLeft =
        this.$refs.customListContainer.scrollLeft + this.customTodoListWidth() - 13;
    },
    customMoveLeft: function () {
      this.$refs.customListContainer.scrollLeft = this.$refs.customListContainer.scrollLeft - this.customTodoListWidth();
    },
    resetCustomList: function () {
      this.$nextTick(function () {
        this.$refs.customListContainer.scrollLeft = 0;
      });
    },
    todoListWidth: function () {
      return this.$refs.weekListContainer.clientWidth / this.columns;
    },
    customTodoListWidth: function () {
      return this.$refs.customListContainer.clientWidth / this.customColumns;
    },
    setSelectedDate: function (date) {
      this.selected_date = date;
      this.$nextTick(function () {
        document
          .getElementById("list" + date)
          .getElementsByClassName("new-todo-input")[0]
          .focus();
      });
    },
    isElectron: function () {
      let isElectron = require("is-electron");
      return isElectron();
    },
    hideSplash: function () {
      if (this.isElectron()) {
        if (this.ipcRenderer.sendSync("is-windows-visible")) {
          this.$refs.splash.hideSplash();
        }
      } else {
        this.$refs.splash.hideSplash();
      }
      this.checksOnLoadApp();
      if (this.$store.getters.config.firstTimeOpen) {
        this.showWelcomeModal();
      }
    },
    showWelcomeModal: function () {
      let modal = new Modal(document.getElementById("welcomeModal"), {
        backdrop: "static",
      });
      modal.show();
      this.$store.commit("updateConfig", { val: false, key: "firstTimeOpen" });
      configRepository.update(this.$store.getters.config);
    },
    compatible: function () {
      return window.IndexedDB;
    },
    resizerDblClick: function () {
      if (this.$store.getters.config.mainDividerPosition != 1) return;

      this.calendarHeight = "calc(50% - 50px)";
      this.$store.commit("updateConfig", {
        val: this.calendarHeight,
        key: "calendarHeight",
      });
      configRepository.update(this.$store.getters.config);
    },
    resizerMouseDownHandler: function (e) {
      if (this.$store.getters.config.mainDividerPosition != 1) return;

      this.resizerY = e.clientY - 50;
      document.addEventListener("mousemove", this.resizerMouseMoveHandler);
      document.addEventListener("mouseup", this.resizerMouseUpHandler);
    },
    resizerMouseMoveHandler: function (e) {
      this.calendarHeight = `${((e.clientY - 50) * 100) / this.zoom}px`;
    },
    resizerMouseUpHandler: function () {
      document.removeEventListener("mousemove", this.resizerMouseMoveHandler);
      document.removeEventListener("mouseup", this.resizerMouseUpHandler);
      this.$store.commit("updateConfig", {
        val: this.calendarHeight,
        key: "calendarHeight",
      });
      configRepository.update(this.$store.getters.config);
    },
    refreshTodayNotifications: function () {
      notifications.refreshDayNotifications(this, moment().format("YYYYMMDD"));
    },
    todoListMounted: function () {
      this.methodsAfterInitialLoad();
    },
    methodsAfterInitialLoad: function () {
      if (!this.initialLoadCompleted) {
        this.initialListLoaded++;
        if (this.initialListLoaded == this.initialListToLoad) {
          this.initialLoadCompleted = true;
          if (this.$store.getters.config.moveOldTasks) {
            this.moveOldTasksToToday().then(() => {
              this.refreshTodayNotifications();
              this.$store.commit("updateConfig", { val: moment().format("YYYYMMDD"), key: "lastDayOpened" });
              configRepository.update(this.$store.getters.config);
              if (isElectron()) this.showInitialNotification();
            });
          } else {
            this.refreshTodayNotifications();
            if (isElectron()) this.showInitialNotification();
            this.$store.commit("updateConfig", { val: moment().format("YYYYMMDD"), key: "lastDayOpened" });
            configRepository.update(this.$store.getters.config);
          }
        }
      }
    },
    showInitialNotification: function () {
      if (!(this.$store.getters.config.notificationOnStartup && !this.$store.getters.config.firstTimeOpen)) return;
      setTimeout(
        function () {
          new Notification("WeekToDo", {
            body: this.initialNotificationText(),
            icon: "/favicon.ico",
            silent: true,
          }).onclick = () => {
            this.ipcRenderer.send("show-current-window");
            setTimeout(() => {
              if (document.getElementById("splashScreen")) {
                document.getElementById("splashScreen").classList.add("hiddenSplashScreen");
              }
            }, 3000);
          };
          notifications.playNotificationSound(this.$store.getters.config.notificationSound);
        }.bind(this),
        2000
      );
    },
    initialNotificationText: function () {
      let yesterdayTasks = this.$store.getters.todoLists[moment().subtract(1, "d").format("YYYYMMDD")];
      let todayTasks = this.$store.getters.todoLists[moment().format("YYYYMMDD")];

      let yesterayPendingTasksCount = taskHelper.pendingTasksCount(yesterdayTasks);
      let todayPendingTasksCount = taskHelper.pendingTasksCount(todayTasks);

      if (yesterayPendingTasksCount == 0 && todayPendingTasksCount == 0) {
        return this.$t("notifications.noPendingTasksToday");
      } else if (yesterayPendingTasksCount == 0) {
        return this.$t("notifications.pendingTasksToday", [todayPendingTasksCount]);
      } else if (todayPendingTasksCount == 0) {
        return this.$t("notifications.pendingTasksYesterday", [yesterayPendingTasksCount]);
      } else {
        return this.$t("notifications.pendingTasksYesterdayAndToday", [yesterayPendingTasksCount, todayPendingTasksCount]);
      }
    },
    resetAppOnDayChange: function () {
      var x = new moment();
      var y = new moment().add(1, "d").startOf("date");
      var duration = moment.duration(y.diff(x)).asMilliseconds();

      setTimeout(
        function () {
          if (isElectron() && !this.ipcRenderer.sendSync("is-windows-visible")) {
            window.location.reload();
          }
          this.refreshTodayNotifications();
          this.resetAppOnDayChange();
        }.bind(this),
        duration
      );
    },
    moveOldTasksToToday: async function () {
      var promise = new Promise((resolve) => {
        var todayListId = moment().format("YYYYMMDD");
        let daysBefore = moment().diff(moment(this.$store.getters.config.lastDayOpened), "days");
        if (daysBefore == 0) daysBefore = 7;
        for (let i = 1; i <= daysBefore; i++) {
          let listId = moment().subtract(i, "d").format("YYYYMMDD");
          this.$store.dispatch("loadTodoLists", listId).then(() => {
            this.$store.commit("moveUndoneItems", { origenId: listId, destinyId: todayListId });
            toDoListRepository.update(listId, this.$store.getters.todoLists[listId]);
            if (this.$store.getters.config.autoReorderTasks) {
              toDoListRepository.update(
                todayListId,
                tasksHelper.reorderTasksList(this.$store.getters.todoLists[todayListId])
              );
            } else {
              toDoListRepository.update(todayListId, this.$store.getters.todoLists[todayListId]);
            }
            if (i == daysBefore) {
              resolve("done!");
            }
          });
        }
      });
      return promise;
    },
    setDividerPosition: function (position) {
      this.$nextTick(function () {
        document.getElementById("app-container").classList.add("scrolling");
        setTimeout(() => {
          document.getElementById("app-container").classList.remove("scrolling");
        }, 400);
        this.$store.commit("updateConfig", { val: position, key: "mainDividerPosition" });
        configRepository.update(this.$store.getters.config);
      });
    },
    checkVersion: function () {
      if (version_json.version != this.$store.getters.config.version) {
        this.$store.commit("updateConfig", { val: version_json.version, key: "version" });
        configRepository.update(this.$store.getters.config);
        var toast = new Toast(document.getElementById("versionChanges"));
        toast.show();
      }
    },
    checkForUpdates: function () {
      if (this.isElectron() && this.$store.getters.config.checkUpdates) {
        const axios = require("axios").default;
        axios
          .get("https://app.weektodo.me/version.json")
          .then((response) => this.showNewVersionToast(response))
          .catch((error) => console.log(error.message));
      }
    },
    checksOnLoadApp: function () {
      if (this.isElectron()) {
        require("electron").ipcRenderer.on("initial-checks", () => {
          this.checkVersion();
          this.checkForUpdates();
        });
      } else {
        this.checkVersion();
      }
    },
    showNewVersionToast: function (response) {
      if (response.data.version != version_json.version) {
        var toast = new Toast(document.getElementById("newVersionAvailable"));
        toast.show();
      }
    },
    downloadNewVersion: function () {
      let isElectron = require("is-electron");
      if (isElectron()) {
        require("electron").shell.openExternal("https://weektodo.me", "_blank");
      } else {
        window.open("https://weektodo.me", "_blank");
      }
    },
    seeChangeLog: function () {
      window.open("https://weektodo.me/changelog", "_blank");
    },
    syncElectronConfig: function () {
      const { ipcRenderer } = require("electron");
      ipcRenderer.send("set-tray-context-menu-label", { open: this.$t("ui.open"), quit: this.$t("ui.quit") });
      ipcRenderer.send("set-open-on-startup", this.$store.getters.config.openOnStartup);
      ipcRenderer.send("set-run-in-background", this.$store.getters.config.runInBackground);
      ipcRenderer.send("set-dark-tray-icon", this.$store.getters.config.darkTrayIcon);
    },
  },
  computed: {
    dates_array: function () {
      if (!this.selected_date) return [];
      var dates_array = [moment(this.selected_date).subtract(1, "d").format("YYYYMMDD"), this.selected_date];

      for (let i = 1; i < this.columns; i++) {
        dates_array.push(moment(this.selected_date).add(i, "d").format("YYYYMMDD"));
      }

      if (this.$store.getters.config.startCalendarYesterday) {
        dates_array.unshift(moment(this.selected_date).subtract(2, "d").format("YYYYMMDD"));
      } else {
        dates_array.push(moment(this.selected_date).add(this.columns, "d").format("YYYYMMDD"));
      }

      this.$store.commit("updateSelectedDates", dates_array);
      return dates_array;
    },
    showCustomList: function () {
      return this.$store.getters.config.customList;
    },
    showCalendar: function () {
      return this.$store.getters.config.calendar;
    },
    columns: function () {
      return this.$store.getters.config.columns;
    },
    customColumns: function () {
      return this.$store.getters.config.customColumns;
    },
    zoom: function () {
      return this.$store.getters.config.zoom;
    },
    darkTheme: function () {
      return this.$store.getters.config.darkTheme;
    },
    resizableStyle: function () {
      if (this.showCalendar && this.showCustomList) {
        return { height: this.calendarHeight };
      } else {
        return {};
      }
    },
    selectedTodo: function () {
      if (this.$store.getters.actions.selectedTodo) {
        return this.$store.getters.actions.selectedTodo;
      }
      return null;
    },
    activeTodo: function () {
      if (this.$store.getters.activeTodo) {
        return this.$store.getters.activeTodo;
      }
      return null;
    },
    mainDividerPositionClass: function () {
      if (this.$store.getters.config.mainDividerPosition == 0) {
        return "on-bottom";
      } else if (this.$store.getters.config.mainDividerPosition == 1) {
        return "on-center";
      } else {
        return "on-top";
      }
    },
    hideTopListContainer: function () {
      if (!this.$store.getters.config.customList || !this.$store.getters.config.calendar) return false;

      return this.$store.getters.config.mainDividerPosition == 2 ? true : false;
    },
    hideBottomListContainer: function () {
      if (!this.$store.getters.config.customList || !this.$store.getters.config.calendar) return false;

      return this.$store.getters.config.mainDividerPosition == 0 ? true : false;
    },
    weekTasks() {
      return this.dates_array.map(date => ({
        date,
        tasks: this.$store.getters.todoLists[date] || []
      }));
    }
  },
};
</script>

<style lang="scss">
@import "/src/assets/style/globalVars.scss";
@import "/src/assets/style/app.scss";
</style>
