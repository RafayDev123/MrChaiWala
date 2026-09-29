// Mr Chai Wala - Desktop entry point (Tauri)
// This is a thin native shell around the offline web app located in `dist/`.
// No network calls, no external services - everything the app needs is
// bundled with the app itself.

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Mr Chai Wala");
}
