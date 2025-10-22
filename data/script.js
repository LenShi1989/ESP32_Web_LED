// 側邊欄功能
let sidebar = document.getElementById("sidebar");
let mainContent = document.getElementById("mainContent");
let sidebarToggle = document.getElementById("sidebarToggle");
let mobileMenuToggle = document.getElementById("mobileMenuToggle");
let sidebarOverlay = document.getElementById("sidebarOverlay");

// 檢測設備類型
function isMobile() {
  return window.innerWidth <= 768;
}

// 切換側邊欄
function toggleSidebar() {
  if (isMobile()) {
    // 手機版：顯示/隱藏側邊欄
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.style.overflow = sidebar.classList.contains("active")
      ? "hidden"
      : "";
  } else {
    // 桌面版：折叠/展開側邊欄
    sidebar.classList.toggle("collapsed");
  }
}

// 關閉側邊欄（手機版）
function closeSidebar() {
  if (isMobile()) {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// 響應式處理
function handleResize() {
  if (window.innerWidth > 768) {
    // 桌面版：確保側邊欄可見
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  } else {
    // 手機版：確保側邊欄隱藏
    sidebar.classList.remove("collapsed");
  }

  // 更新折疊按鈕圖標
  updateToggleIcon();
}

// 更新折疊按鈕圖標
function updateToggleIcon() {
  if (!isMobile()) {
    const icon = sidebarToggle.querySelector("i");
    if (sidebar.classList.contains("collapsed")) {
      icon.className = "fas fa-chevron-right";
    } else {
      icon.className = "fas fa-chevron-left";
    }
  }
}

// 頁面導航高亮
function highlightCurrentPage() {
  const currentPage = window.location.pathname;
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.classList.remove("active");
    const link = item.querySelector(".nav-link");
    if (link.getAttribute("href") === currentPage) {
      item.classList.add("active");
    }
  });
}

// 導航連結點擊處理（手機版）
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (isMobile()) {
        // 手機版點擊導航後自動關閉側邊欄
        setTimeout(() => {
          closeSidebar();
        }, 300);
      }
    });
  });
}

// 點擊遮罩層關閉側邊欄
function setupOverlay() {
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }
}

// 更新系統狀態
async function updateSystemStatus() {
  try {
    const response = await fetch("/api/system/info");
    const data = await response.json();

    if (data.status === "success") {
      // 更新頂部狀態欄
      document.getElementById("heapMemory").textContent =
        Math.floor(data.memory.free_heap / 1024) + "K";
      document.getElementById("wifiRSSI").textContent = data.wifi.rssi;

      // 更新運行時間
      const uptimeMinutes = Math.floor(data.system.uptime / 1000 / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);
      const uptimeText =
        uptimeHours > 0
          ? `${uptimeHours}時${uptimeMinutes % 60}分`
          : `${uptimeMinutes}分`;

      document.getElementById("uptime").textContent = uptimeText;

      // 更新狀態卡片
      document.getElementById(
        "wifiStatus"
      ).textContent = `${data.wifi.rssi} dBm`;
      document.getElementById("memoryStatus").textContent =
        Math.floor(data.memory.free_heap / 1024) + " KB";
      document.getElementById("uptimeStatus").textContent = uptimeText;
    }
  } catch (error) {
    console.error("Error updating system status:", error);
  }
}

// 頁面初始化
document.addEventListener("DOMContentLoaded", function () {
  // 側邊欄事件
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", toggleSidebar);
  }

  // 設定導航和遮罩層
  setupNavigation();
  setupOverlay();

  // 高亮當前頁面
  highlightCurrentPage();

  // 初始更新
  updateSystemStatus();
  updateBulbStatus();

  // 定期更新
  setInterval(updateSystemStatus, 5000);
  setInterval(updateBulbStatus, 3000);

  // 視窗大小監聽
  window.addEventListener("resize", handleResize);

  // 初始處理響應式
  handleResize();
  updateToggleIcon();

  // ESC鍵關閉側邊欄
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSidebar();
    }
  });
});

// 其他現有函數保持不變...
