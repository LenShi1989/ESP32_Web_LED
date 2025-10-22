// LED 控制函數
async function controlLED(action) {
    try {
        const response = await fetch(`/api/led/${action}`, {
            method: "POST",
        });

        const data = await response.json();

        if (data.status === "success") {
            updateLEDStatus(data.led_state);
            updateBulbStatus(); // 更新燈泡顯示 (內部已包含空值檢查)
            showNotification(data.message, "success");
            updateSystemStatus();
        } else {
            showNotification("操作失敗", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showNotification("網路錯誤", "error");
    }
}

// 更新燈泡狀態顯示
async function updateBulbStatus() {
    try {
        const response = await fetch("/api/bulb/status");
        const data = await response.json();

        if (data.status === "success") {
            const bulb = document.getElementById("bulb");
            const filament = document.getElementById("filament");
            const bulbStatus = document.getElementById("bulbStatus");

            // 如果燈泡相關元素不存在，則不執行更新
            if (!bulb || !filament || !bulbStatus) {
                return;
            }

            // 更新燈泡類別
            bulb.className = `bulb ${data.bulb_glow}`;
            filament.className = `filament ${data.bulb_glow}`;

            // 更新狀態文字
            bulbStatus.textContent = data.status_text;

            // 添加過渡效果
            // 這些過渡效果已在 CSS 中定義，通常無需在 JS 中重複設定
            // bulb.style.transition = "all 0.5s ease";
            // filament.style.transition = "all 0.5s ease";
        }
    } catch (error) {
        console.error("Error updating bulb status:", error);
    }
}

// 更新 LED 狀態顯示
function updateLEDStatus(state) {
    const ledStateElement = document.getElementById("ledState");
    const ledStatusElement = document.querySelector(".led-status");

    // 如果 LED 狀態相關元素不存在，則不執行更新
    if (!ledStateElement || !ledStatusElement) {
        return;
    }

    if (state) {
        ledStateElement.textContent = "開啟";
        ledStatusElement.className = "led-status green";
    } else {
        ledStateElement.textContent = "關閉";
        ledStatusElement.className = "led-status red";
    }
    // 注意：原先 `ledStatusElement.textContent = "GPIO 2 狀態: 開啟/關閉";` 會覆蓋掉 `<span>` 元素。
    // 現在只更新 `<span>` 的內容和 `<div>` 的類別，以保持 HTML 結構。
}

// 顯示通知
function showNotification(message, type) {
    // 創建通知元素
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === "success" ? "✅" : "❌"
        }</span>
        <span class="notification-text">${message}</span>
    `;

    // 添加到頁面
    document.body.appendChild(notification);

    // 顯示動畫
    setTimeout(() => {
        notification.classList.add("show");
    }, 100);

    // 自動移除
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 更新系統狀態
async function updateSystemStatus() {
    try {
        const systemStatusElement = document.getElementById("systemStatus");
        // 如果系統狀態元素不存在，則不執行更新
        if (!systemStatusElement) {
            return;
        }

        const response = await fetch("/api/status");
        const data = await response.json();

        if (data.status === "success") {
            document.getElementById("systemStatus").innerHTML = `
                <p>LED 狀態: ${data.led_state ? "開啟" : "關閉"}</p>
                <p>可用記憶體: ${data.free_heap} bytes</p>
                <p>Wi-Fi 訊號: ${data.wifi_rssi} dBm</p>
            `; // 使用 systemStatusElement 而不是 document.getElementById("systemStatus")
        }
    } catch (error) {
        console.error("Error updating system status:", error);
    }
}

// 定期更新系統狀態和燈泡狀態
setInterval(() => {
    updateSystemStatus();
    updateBulbStatus();
}, 1000);

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
    updateSystemStatus();
    updateBulbStatus();

    // 添加燈泡點擊切換功能
    const bulb = document.getElementById("bulb"); // 獲取燈泡元素
    if (bulb) { // 檢查燈泡元素是否存在
        bulb.addEventListener("click", function () {
            controlLED("toggle");
        });
    }
});


// --------------------------------------------------------------------


// 側邊欄功能
let sidebar = document.getElementById('sidebar');
let mainContent = document.getElementById('mainContent');
let sidebarToggle = document.getElementById('sidebarToggle');

// 切換側邊欄
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

// 響應式側邊欄
function handleResize() {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('collapsed');
    }
}

// 頁面導航高亮
function highlightCurrentPage() {
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('.nav-link');
        if (link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

// 更新系統狀態
async function updateSystemStatus() {
    try {
        const response = await fetch('/api/system/info');
        const data = await response.json();

        if (data.status === 'success') {
            // 更新頂部狀態欄
            document.getElementById('heapMemory').textContent = data.memory.free_heap.toLocaleString();
            document.getElementById('wifiRSSI').textContent = data.wifi.rssi;

            // 更新運行時間
            const uptime = Math.floor(data.system.uptime / 1000 / 60); // 分鐘
            document.getElementById('uptime').innerHTML = `<i class="fas fa-clock"></i> ${uptime} 分鐘`;

            // 更新狀態卡片
            document.getElementById('wifiStatus').textContent = `${data.wifi.rssi} dBm`;
            document.getElementById('memoryStatus').textContent = `${data.memory.free_heap.toLocaleString()} bytes`;
            document.getElementById('uptimeStatus').textContent = `${uptime} 分鐘`;
        }
    } catch (error) {
        console.error('Error updating system status:', error);
    }
}

// 頁面初始化
document.addEventListener('DOMContentLoaded', function () {
    // 側邊欄事件
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // 高亮當前頁面
    highlightCurrentPage();

    // 初始更新
    updateSystemStatus();
    updateBulbStatus();

    // 定期更新
    setInterval(updateSystemStatus, 5000);
    setInterval(updateBulbStatus, 3000);

    // 視窗大小監聽
    window.addEventListener('resize', handleResize);

    // 初始處理響應式
    handleResize();
});

// 其他現有函數保持不變...
