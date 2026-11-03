@echo off
chcp 65001 >nul
title Tự Động Đẩy Mã Nguồn Lên GitHub - Hỷ Sự
cls
cd /d "%~dp0"
echo ======================================================================
echo           CÔNG CỤ TỰ ĐỘNG ĐẨY MÃ NGUỒN LÊN GITHUB CHO HỶ SỰ
echo ======================================================================
echo.
echo Bạn không cần phải nhớ hay gõ bất kỳ câu lệnh phức tạp nào!
echo Công cụ này sẽ tự động đóng gói và đẩy dự án lên GitHub cho bạn.
echo.

:: 1. Hoi link GitHub hoac dung mac dinh
set DEFAULT_REPO=https://github.com/giangtienphat-nhidong315/hysu.git
echo Link kho GitHub hien tai: %DEFAULT_REPO%
echo.
set /p USER_INPUT=">> Nhan [ENTER] de day len kho nay (hoac dan link moi vao day): "

if "%USER_INPUT%"=="" (
    set REPO_URL=%DEFAULT_REPO%
) else (
    set REPO_URL=%USER_INPUT%
)

echo.
echo [1/4] Đang thiết lập thông tin cơ bản...
git config user.name "HySu Wedding Planner"
git config user.email "support@hysu.app"

echo [2/4] Đang gom toàn bộ file mã nguồn dự án...
git add .

echo [3/4] Đang tạo bản lưu trữ (commit)...
git commit -m "Triển khai ứng dụng Hỷ Sự lên GitHub"

echo [4/4] Đang kết nối và đẩy lên GitHub: %REPO_URL%
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ======================================================================
echo [XONG] Đã hoàn thành quá trình tải lên!
echo Bây giờ bạn hãy vào trang GitHub của mình, chọn:
echo Settings -> Pages -> Source chọn "GitHub Actions" là web sẽ chạy!
echo ======================================================================
echo.
pause
