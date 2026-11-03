@echo off
chcp 65001 >nul
title Tự Động Đưa Ứng Dụng Hỷ Sự Lên Vercel (Trực Tuyến)
cls
cd /d "%~dp0"

echo ======================================================================
echo           CÔNG CỤ TỰ ĐỘNG ĐƯA ỨNG DỤNG LÊN MẠNG TRỰC TUYẾN VERCEL
echo ======================================================================
echo.
echo Vercel là nền tảng máy chủ đám mây siêu tốc độ cao và miễn phí.
echo Sau khi tải lên, bạn sẽ nhận được đường link web trực tuyến dạng:
echo   👉 https://ten-ung-dung.vercel.app
echo Bất kỳ ai trên điện thoại hay máy tính đều có thể truy cập ngay!
echo.
echo ----------------------------------------------------------------------
echo [LƯU Ý LẦN ĐẦU TIÊN]:
echo 1. Nếu đây là lần đầu chạy, Vercel CLI sẽ hỏi đăng nhập:
echo    - Nhấn Enter để chọn đăng nhập bằng GitHub hoặc Google hoặc Email.
echo    - Trình duyệt web sẽ tự động mở lên để bạn xác nhận 1 chạm.
echo 2. Khi được hỏi:
echo    - "Set up and deploy ...?" -> Gõ Y (Yes) rồi Enter
echo    - "Which scope ...?" -> Nhấn Enter
echo    - "Link to existing project?" -> Gõ N (No) rồi Enter
echo    - "What's your project's name?" -> Nhấn Enter (để mặc định)
echo    - "In which directory is your code located?" -> Nhấn Enter
echo ----------------------------------------------------------------------
echo.

set /p CONFIRM=">> Bạn có muốn bắt đầu đưa ứng dụng lên Vercel ngay bây giờ? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo Đã hủy thao tác. Bạn có thể chạy lại bất cứ lúc nào!
    pause
    exit /b
)

echo.
echo [1/2] Đang kiểm tra và đóng gói dự án (build)...
call npm.cmd run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [LỖI] Quá trình build thất bại. Vui lòng kiểm tra lại mã nguồn!
    pause
    exit /b
)

echo.
echo [2/2] Đang tải lên và triển khai lên máy chủ Vercel (Production)...
call npx.cmd --yes vercel --prod

echo.
echo ======================================================================
echo [HOÀN TẤT] Ứng dụng Hỷ Sự của bạn đã được triển khai lên Vercel thành công!
echo Hãy sao chép đường link hiển thị ở trên (Production URL) để sử dụng hoặc
echo chia sẻ cho người thân/bạn bè.
echo ======================================================================
echo.
pause
