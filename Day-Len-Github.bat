@echo off
chcp 65001 >nul
title Tự Động Đẩy Mã Nguồn Lên GitHub - Hỷ Sự
cls
cd /d "%~dp0"

echo ======================================================================
echo           CÔNG CỤ ĐẨY DỰ ÁN HỶ SỰ LÊN GITHUB
echo ======================================================================
echo.
echo Kho GitHub đích: https://github.com/giangtienphat-nhidong315/hysu.git
echo.
echo HƯỚNG DẪN:
echo Do GitHub bảo mật rất cao, để không bị treo màn hình khi đăng nhập:
echo.
echo [Cách khuyên dùng - Nhanh nhất & Chắc chắn 100%%]:
echo Bạn hãy dán mã Personal Access Token (Mã token cá nhân của GitHub) vào dưới.
echo (Nếu chưa có mã, xem hướng dẫn lấy mã trong 30 giây ở màn hình chat).
echo.
echo ======================================================================
echo.
set /p TOKEN=">> Dán mã Token GitHub của bạn vào đây (hoặc nhấn ENTER nếu muốn thử mở trình duyệt): "

echo.
echo [1/3] Đang chuẩn bị dữ liệu mã nguồn...
git config user.name "giangtienphat-nhidong315"
git config user.email "support@hysu.app"
git branch -M main

if "%TOKEN%"=="" (
    echo.
    echo [2/3] Đang kết nối GitHub qua trình duyệt thông thường...
    echo (LƯU Ý: Nếu thấy cửa sổ GitHub nhỏ hiện lên trên màn hình, hãy bấm Sign In!)
    git remote remove origin >nul 2>&1
    git remote add origin https://github.com/giangtienphat-nhidong315/hysu.git
) else (
    echo.
    echo [2/3] Đang kết nối GitHub bằng mã xác thực Token an toàn...
    git remote remove origin >nul 2>&1
    git remote add origin https://%TOKEN%@github.com/giangtienphat-nhidong315/hysu.git
)

echo.
echo [3/3] Đang đẩy toàn bộ mã nguồn lên GitHub (Vui lòng đợi vài giây)...
echo ----------------------------------------------------------------------
git push -u origin main --progress -v
echo ----------------------------------------------------------------------

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo 🎉 [THÀNH CÔNG RỰC RỠ!] Toàn bộ mã nguồn đã được tải lên GitHub!
    echo.
    echo BƯỚC CUỐI ĐỂ CÓ LINK ONLINE MIỄN PHÍ:
    echo 1. Vào: https://github.com/giangtienphat-nhidong315/hysu/settings/pages
    echo 2. Tại mục "Source" -> Chọn "GitHub Actions"
    echo 3. Đợi 1 phút là trang web https://giangtienphat-nhidong315.github.io/hysu/ sẽ hoạt động!
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo ⚠️ Có lỗi xảy ra trong quá trình đẩy lên (thường do chưa cấp quyền xác thực).
    echo Hãy dùng mã Token cá nhân (Personal Access Token) để thành công 100%%!
    echo ======================================================================
)

echo.
pause
