// 防止 Windows release 构建弹出控制台
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ai_news_desktop_lib::run()
}
