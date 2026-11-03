import { ContractItem, CoupleProfile, ExpenseItem, TaskItem, GuestItem, DayScheduleItem, VendorItem } from '../types/wedding';
import { EXPENSE_CATEGORIES, GUEST_GROUP_LABELS, RSVP_STATUS_LABELS } from '../data/categories';

export interface WeddingFullData {
  profile: CoupleProfile;
  expenses: ExpenseItem[];
  tasks: TaskItem[];
  guests: GuestItem[];
  schedule: DayScheduleItem[];
  vendors: VendorItem[];
  contracts?: ContractItem[];
}

export const generateAppsScriptCode = (): string => {
  return `/**
 * GOOGLE APPS SCRIPT ĐỒNG BỘ DỮ LIỆU ĐÁM CƯỚI - HỶ SỰ
 * Hướng dẫn cài đặt trong 30 giây:
 * 1. Mở Google Sheets mới (sheet.new)
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script
 * 3. Xóa hết code cũ, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn nút "Triển khai" (Deploy) > "Triển khai mới" (New deployment)
 * 5. Chọn loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 6. Bấm "Triển khai" (Deploy), cấp quyền và sao chép Web App URL dán vào ứng dụng Hỷ Sự.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Sheet Thông Tin Ngày Cưới
    var sheetInfo = getOrCreateSheet(ss, "1. ThongTinNgayCuoi");
    sheetInfo.clear();
    sheetInfo.appendRow(["MỤC", "THÔNG TIN CHI TIẾT"]);
    sheetInfo.appendRow(["Chú Rể", data.profile.groomName]);
    sheetInfo.appendRow(["Cô Dâu", data.profile.brideName]);
    sheetInfo.appendRow(["Ngày Cưới", data.profile.weddingDate]);
    sheetInfo.appendRow(["Giờ Cử Hành", data.profile.weddingTime]);
    sheetInfo.appendRow(["Địa Điểm Tiệc", data.profile.venue]);
    sheetInfo.appendRow(["Ngân Sách Mục Tiêu (VNĐ)", data.profile.targetBudget]);
    sheetInfo.appendRow(["Lần Đồng Bộ Cuối", new Date().toLocaleString("vi-VN")]);
    formatHeader(sheetInfo, 2);

    // 2. Sheet Chi Tiêu & Ngân Sách
    var sheetExp = getOrCreateSheet(ss, "2. ChiTieu_NganSach");
    sheetExp.clear();
    sheetExp.appendRow(["Hạng Mục", "Tên Khoản Chi", "Dự Tính (VNĐ)", "Thực Tế (VNĐ)", "Đã Trả (VNĐ)", "Còn Nợ (VNĐ)", "Bên Chi", "Trạng Thái", "Ghi Chú", "SĐT Nhà Cung Cấp"]);
    if (data.expenses && data.expenses.length > 0) {
      data.expenses.forEach(function(item) {
        var debt = Math.max(0, (item.actualAmount || 0) - (item.paidAmount || 0));
        sheetExp.appendRow([
          item.categoryId,
          item.title,
          item.estimatedAmount || 0,
          item.actualAmount || 0,
          item.paidAmount || 0,
          debt,
          item.payer === "both" ? "Cả hai" : (item.payer === "groom" ? "Nhà trai" : "Nhà gái"),
          item.status === "paid" ? "Đã xong" : (item.status === "deposit" ? "Đã cọc" : "Chưa trả"),
          item.notes || "",
          item.vendorPhone || ""
        ]);
      });
    }
    formatHeader(sheetExp, 10);

    // 3. Sheet Khách Mời & Điểm Danh Dự Tiệc
    var sheetGuests = getOrCreateSheet(ss, "3. KhachMoi_DiemDanh");
    sheetGuests.clear();
    sheetGuests.appendRow(["Họ Và Tên", "Nhóm Khách", "Số Điện Thoại", "Bàn Tiệc", "Trạng Thái Thiệp", "Đi Cùng (+Người)", "Đã Đến Tiệc", "Giờ Đến", "Ăn Chay", "Tiền Mừng (VNĐ)", "Ghi Chú"]);
    if (data.guests && data.guests.length > 0) {
      data.guests.forEach(function(g) {
        sheetGuests.appendRow([
          g.name,
          g.group,
          g.phone || "",
          g.tableNumber || "",
          g.invitationStatus,
          g.plusGuests || 0,
          g.isCheckedIn ? "CÓ MẶT" : "Chưa đến",
          g.checkInTime || "",
          g.isVegetarian ? "Có" : "",
          g.actualGift || 0,
          g.notes || ""
        ]);
      });
    }
    formatHeader(sheetGuests, 11);

    // 4. Sheet Kế Hoạch Chuẩn Bị
    var sheetTasks = getOrCreateSheet(ss, "4. KeHoach_Timeline");
    sheetTasks.clear();
    sheetTasks.appendRow(["Giai Đoạn", "Công Việc", "Hạn Chót", "Đã Xong", "Phụ Trách", "Ưu Tiên", "Phân Loại"]);
    if (data.tasks && data.tasks.length > 0) {
      data.tasks.forEach(function(t) {
        sheetTasks.appendRow([
          t.phase,
          t.title,
          t.dueDate,
          t.isCompleted ? "HOÀN THÀNH" : "Đang làm",
          t.assignee,
          t.priority,
          t.category || ""
        ]);
      });
    }
    formatHeader(sheetTasks, 7);

    // 5. Sheet Hợp Đồng & Giấy Tờ
    if (data.contracts && data.contracts.length > 0) {
      var sheetCtr = getOrCreateSheet(ss, "5. HopDong_DichVu");
      sheetCtr.clear();
      sheetCtr.appendRow(["Tên Hợp Đồng", "Bên Cung Cấp", "Hạng Mục", "Ngày Ký", "Tổng Giá Trị (VNĐ)", "Đã Đặt Cọc (VNĐ)", "Còn Lại (VNĐ)", "Số Ảnh Lưu", "SĐT", "Ghi Chú Điều Khoản"]);
      data.contracts.forEach(function(c) {
        var debt = Math.max(0, (c.contractValue || 0) - (c.depositValue || 0));
        sheetCtr.appendRow([
          c.title,
          c.vendorName,
          c.category,
          c.signedDate,
          c.contractValue || 0,
          c.depositValue || 0,
          debt,
          c.images ? c.images.length : 0,
          c.vendorPhone || "",
          c.notes || ""
        ]);
      });
      formatHeader(sheetCtr, 10);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đồng bộ lên Google Sheet thành công lúc " + new Date().toLocaleTimeString("vi-VN")
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Hy Su Wedding Google Sheets Sync Service"
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeader(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground("#e11d48");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}
`;
};

export const syncToGoogleSheets = async (
  webhookUrl: string,
  payload: WeddingFullData
): Promise<{ success: boolean; message: string }> => {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('Vui lòng nhập đường dẫn Web App URL của Google Sheets.');
  }

  const cleanUrl = webhookUrl.trim();

  // Validate standard Google script web app URL format
  if (!cleanUrl.startsWith('https://script.google.com/')) {
    throw new Error('Đường dẫn phải bắt đầu bằng https://script.google.com/...');
  }

  try {
    // Send with text/plain to avoid CORS preflight options check
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();
    try {
      const json = JSON.parse(resultText);
      if (json.success) {
        return { success: true, message: json.message || 'Đồng bộ Google Sheets thành công!' };
      } else {
        return { success: false, message: json.error || 'Google Sheet trả về lỗi.' };
      }
    } catch {
      // Some Google apps script redirects return HTML or status 200 text
      return { success: true, message: 'Đã gửi dữ liệu đồng bộ lên Google Sheet thành công!' };
    }
  } catch (error: any) {
    console.error('Google Sheets Sync error:', error);
    throw new Error(error.message || 'Lỗi kết nối đến Google Sheets. Hãy kiểm tra URL Webhook.');
  }
};
