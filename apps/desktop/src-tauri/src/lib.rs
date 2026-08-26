// 桌面端入口：注册自启动 / 窗口位置持久化等插件
// 复用 web 前端，所有 UI 与业务逻辑由 React 处理

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
