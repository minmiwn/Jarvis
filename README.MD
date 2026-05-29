# 🤖 Jarvis AI Assistant (v0.3)

**Jarvis** là trợ lý ảo tương tác bằng giọng nói (Voice-to-Voice) và văn bản thời gian thực. Hệ thống được xây dựng trên nền tảng **LiveKit Agents** kết hợp với **Google Gemini Realtime Model**, tích hợp bộ nhớ dài hạn **Mem0** để cá nhân hóa cuộc hội thoại và các công cụ tra cứu thông tin (tìm kiếm web, thời tiết).

---

## ✨ Tính năng nổi bật

*   **🎙️ Tương tác Giọng nói thời gian thực (Real-time Voice):** Độ trễ cực thấp nhờ WebRTC (LiveKit) kết hợp với Gemini Realtime Model.
*   **🧠 Bộ nhớ Dài hạn (Mem0):** Lưu trữ thông tin cá nhân của người dùng (sở thích, công việc, các chủ đề cũ) qua các phiên làm việc và chủ động hỏi thăm/gợi mở câu chuyện khi kết nối lại.
*   **🔍 Công cụ tích hợp (Function Calling):**
    *   `search_web`: Tìm kiếm thông tin trực tuyến thời gian thực qua DuckDuckGo.
    *   `get_weather`: Tra cứu thời tiết tại bất kỳ thành phố nào qua API `wttr.in`.
*   **💬 Cá tính độc đáo:** Giao tiếp tự nhiên như một người bạn thân (sử dụng slang, hài hước, có chút mỉa mai/roast nhẹ thân thiện như *"Bro..."*, *"Skill issue rồi boss"*, *"Trời ơi luôn á"*).
*   **🎵 Visualizer sinh động:** Giao diện frontend hiển thị sóng âm thanh động khi trợ lý hoặc người dùng đang nói.

---

## 🛠️ Kiến trúc hệ thống

Dự án được chia thành hai phần chính:

### 1. Backend (Python + FastAPI)
*   `agent.py`: Script khởi chạy LiveKit Agent. Nhận luồng âm thanh từ phòng LiveKit, gửi đến Gemini Realtime API, xử lý giảm tiếng ồn bằng `livekit-plugins-noise-cancellation` (BVC) và thực thi các công cụ (tools). Khi tắt agent, nó sẽ tự động lưu lại ngữ cảnh cuộc gọi vào bộ nhớ Mem0.
*   `token_server.py`: API FastAPI để sinh JWT Connection Token cho frontend kết nối an toàn vào phòng LiveKit.
*   `tools.py`: Định nghĩa các hàm bổ trợ (tìm kiếm web, thời tiết) dưới dạng LiveKit `function_tool`.
*   `promps.py`: Quản lý hệ thống prompts định hình tính cách và hành vi của Jarvis.

### 2. Frontend (React + Vite + TailwindCSS)
*   Sử dụng `@livekit/components-react` và `livekit-client` để quản lý kết nối WebRTC và render âm thanh.
*   Thiết kế giao diện tối với phong cách Cyberpunk/Neon tím hiện đại.
*   Các thành phần giao diện bao gồm: Sidebar, ChatHeader, MessageList, MessageInput, Visualizer và BottomBar để điều khiển bật/tắt mic/tai nghe.

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy của bạn đã cài đặt:
*   **Python:** Phiên bản 3.10 trở lên
*   **Node.js:** Phiên bản 18 trở lên (kèm theo npm)
*   **LiveKit Cloud Account / Server:** Bạn cần có một dự án LiveKit (miễn phí trên LiveKit Cloud) để lấy thông tin kết nối WebRTC.

---

## 🚀 Hướng dẫn cài đặt và cấu hình

### Bước 1: Cấu hình biến môi trường Backend

Vào thư mục `backend/`, copy file `.env.example` thành `.env` và điền đầy đủ thông tin:

```env
# Kết nối LiveKit (Lấy từ LiveKit Cloud Dashboard)
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# API Key Google Gemini (Dành cho Realtime Model)
GOOGLE_API_KEY=your-gemini-api-key

# API Key Mem0 (Dành cho bộ nhớ trợ lý)
MEM0_API_KEY=your-mem0-api-key
```

### Bước 2: Cấu hình biến môi trường Frontend

Vào thư mục `frontend/`, kiểm tra hoặc tạo file `.env` chứa thông tin Token Server và URL LiveKit:

```env
VITE_LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
VITE_TOKEN_SERVER_URL=http://localhost:8000
```

---

## 🏁 Khởi chạy ứng dụng

Dự án đã được tích hợp sẵn một script khởi chạy tự động toàn bộ dịch vụ: `run.sh` ở thư mục gốc.

1.  **Cấp quyền thực thi cho script (chỉ cần làm lần đầu):**
    ```bash
    chmod +x run.sh
    ```

2.  **Chạy tất cả các dịch vụ (Frontend, Backend Token Server & LiveKit Agent):**
    ```bash
    ./run.sh
    ```

### Script `run.sh` sẽ tự động thực hiện:
*   Kiểm tra và cài đặt các thư viện Python thiếu trong `requirements.txt` bằng `uv` hoặc `pip`.
*   Kiểm tra và cài đặt các npm packages trong thư mục `frontend/`.
*   Khởi chạy **FastAPI Token Server** tại cổng `8000`.
*   Khởi chạy **LiveKit Agent Worker** kết nối vào phòng chờ.
*   Khởi chạy **Vite Dev Server** cho Frontend tại cổng `5173`.

Sau khi chạy thành công, bạn truy cập vào địa chỉ [http://localhost:5173](http://localhost:5173) để bắt đầu trò chuyện với Jarvis! Nhấn **Ctrl+C** trên terminal để dừng tất cả các tiến trình một cách an toàn.

---

## 📂 Cấu trúc thư mục dự án

```text
Jarvis_03/
├── backend/                  # Mã nguồn phía Server
│   ├── KMS/                  # Hệ thống quản lý tri thức / Tài liệu phụ trợ
│   ├── agent.py              # Logic chính của LiveKit Agent & Mem0
│   ├── token_server.py       # API FastAPI sinh token kết nối LiveKit
│   ├── tools.py              # Khai báo các công cụ bổ trợ (Weather, Search)
│   ├── promps.py             # System & Session prompts cấu hình tính cách Jarvis
│   ├── requirements.txt      # Thư viện Python yêu cầu
│   └── .env.example          # Mẫu cấu hình môi trường backend
│
├── frontend/                 # Giao diện người dùng React
│   ├── src/
│   │   ├── components/       # Các UI Component (chat, controls, layout)
│   │   ├── hooks/            # Custom React Hooks (useLiveKitToken)
│   │   ├── App.jsx           # Entrypoint giao diện chính
│   │   └── main.jsx
│   ├── package.json          # Quản lý dependencies node
│   └── .env                  # Cấu hình môi trường frontend
│
├── run.sh                    # Script chạy toàn bộ dự án tiện lợi
└── README.MD                 # Tài liệu hướng dẫn sử dụng (File này)
```