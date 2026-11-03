@echo off
chcp 65001 >nul
title Hỷ Sự - Sổ Tay Kế Hoạch & Quản Lý Chi Tiêu Đám Cưới
cls
echo ==============================================================
echo       ỨNG DỤNG LÊN KẾ HOẠCH & QUẢN LÝ CHI TIÊU ĐÁM CƯỚI - HỶ SỰ
echo ==============================================================
echo.
echo Đang kiểm tra và khởi động ứng dụng trên máy tính của bạn...
echo.

:: Mở trình duyệt web sau 2 giây
start "" http://localhost:5173/

:: Chạy máy chủ dev Vite
call npm.cmd run dev

pause
