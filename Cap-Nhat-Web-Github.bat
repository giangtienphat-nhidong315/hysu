@echo off
chcp 65001 >nul
title Cập Nhật Ứng Dụng Hỷ Sự Lên GitHub
cls
cd /d "%~dp0"

echo ======================================================================
echo           TỰ ĐỘNG ĐÓNG GÓI & CẬP NHẬT ỨNG DỤNG LÊN GITHUB
echo ======================================================================
echo.

echo [1/3] Đang lưu trữ mã nguồn mới...
git add .
git commit -m "Cap nhat ung dung Hy Su" >nul 2>&1
git push origin main

echo.
echo [2/3] Đang đóng gói bản web mới (Build)...
call npm.cmd run build

echo.
echo [3/3] Đang đẩy bản web trực tuyến lên nhánh gh-pages...
cd dist
copy index.html 404.html >nul 2>&1
git init >nul 2>&1
git checkout -B gh-pages >nul 2>&1
git config user.name "giangtienphat-nhidong315"
git config user.email "support@hysu.app"
git add -A
git commit -m "Cap nhat ban web truc tuyen" >nul 2>&1
git remote add origin https://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@github.com/giangtienphat-nhidong315/hysu.git >nul 2>&1
git push -f origin gh-pages

cd ..
rmdir /s /q dist\.git >nul 2>&1

echo.
echo ======================================================================
echo 🎉 [HOÀN TẤT!] Ứng dụng trực tuyến của bạn đã được cập nhật thành công!
echo Link web: https://giangtienphat-nhidong315.github.io/hysu/
echo ======================================================================
echo.
pause
