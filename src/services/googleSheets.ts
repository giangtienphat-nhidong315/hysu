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

    // 0. Lưu bản sao JSON nguyên bản 100% vào Script Properties để phục vụ đồng bộ chính xác tuyệt đối
    PropertiesService.getScriptProperties().setProperty("HYSU_DATA_BACKUP", raw);

    // 1. Sheet Thông Tin Ngày Cưới
    var sheetInfo = getOrCreateSheet(ss, "1. ThongTinNgayCuoi");
    sheetInfo.clear();
    sheetInfo.appendRow(["MỤC", "THÔNG TIN CHI TIẾT"]);
    sheetInfo.appendRow(["Chú Rể", data.profile.groomName]);
    sheetInfo.appendRow(["Cô Dâu", data.profile.brideName]);
    sheetInfo.appendRow(["Ngày Cưới", "'" + (data.profile.weddingDate || "")]);
    sheetInfo.appendRow(["Giờ Cử Hành", "'" + (data.profile.weddingTime || "")]);
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
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 0. Ưu tiên đọc bản sao JSON nguyên bản 100% nếu có
    var rawBackup = PropertiesService.getScriptProperties().getProperty("HYSU_DATA_BACKUP");
    if (rawBackup) {
      try {
        var parsedBackup = JSON.parse(rawBackup);
        if (parsedBackup && (parsedBackup.profile || parsedBackup.guests)) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            data: parsedBackup,
            timestamp: new Date().toISOString()
          })).setMimeType(ContentService.MimeType.JSON);
        }
      } catch (errBackup) {}
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result = {
      profile: null,
      expenses: [],
      guests: [],
      tasks: [],
      contracts: []
    };

    // 1. Đọc Sheet Thông Tin Ngày Cưới
    var sheetInfo = ss.getSheetByName("1. ThongTinNgayCuoi");
    if (sheetInfo) {
      var rowsInfo = sheetInfo.getDataRange().getValues();
      var prof = {};
      for (var i = 1; i < rowsInfo.length; i++) {
        var key = String(rowsInfo[i][0]).toLowerCase().trim();
        var val = rowsInfo[i][1];
        if (key.indexOf("chú rể") !== -1 || key.indexOf("chu re") !== -1 || key === "groom") prof.groomName = String(val || "");
        if (key.indexOf("cô dâu") !== -1 || key.indexOf("co dau") !== -1 || key === "bride") prof.brideName = String(val || "");
        if (key.indexOf("ngày cưới") !== -1 || key.indexOf("ngay cuoi") !== -1 || key === "date") prof.weddingDate = formatGasDate(val);
        if (key.indexOf("giờ") !== -1 || key.indexOf("gio") !== -1 || key === "time") prof.weddingTime = formatGasTime(val);
        if (key.indexOf("địa điểm") !== -1 || key.indexOf("dia diem") !== -1 || key === "venue") prof.venue = String(val || "");
        if (key.indexOf("ngân sách") !== -1 || key.indexOf("ngan sach") !== -1 || key === "budget") prof.targetBudget = Number(val || 0);
      }
      result.profile = prof;
    }

    // 2. Đọc Sheet Chi Tiêu
    var sheetExp = ss.getSheetByName("2. ChiTieu_NganSach");
    if (sheetExp && sheetExp.getLastRow() > 1) {
      var rowsExp = sheetExp.getDataRange().getValues();
      for (var j = 1; j < rowsExp.length; j++) {
        var rExp = rowsExp[j];
        if (!rExp[1]) continue;
        result.expenses.push({
          id: "exp-" + j + "-" + Date.now(),
          categoryId: String(rExp[0] || "other"),
          title: String(rExp[1] || ""),
          estimatedAmount: Number(rExp[2] || 0),
          actualAmount: Number(rExp[3] || 0),
          paidAmount: Number(rExp[4] || 0),
          payer: rExp[6] === "Nhà trai" ? "groom" : (rExp[6] === "Nhà gái" ? "bride" : "both"),
          status: rExp[7] === "Đã xong" ? "paid" : (rExp[7] === "Đã cọc" ? "deposit" : "unpaid"),
          notes: String(rExp[8] || ""),
          vendorPhone: String(rExp[9] || "")
        });
      }
    }

    // 3. Đọc Sheet Khách Mời & Điểm Danh
    var sheetGuests = ss.getSheetByName("3. KhachMoi_DiemDanh");
    if (sheetGuests && sheetGuests.getLastRow() > 1) {
      var rowsG = sheetGuests.getDataRange().getValues();
      for (var k = 1; k < rowsG.length; k++) {
        var rg = rowsG[k];
        if (!rg[0]) continue;
        result.guests.push({
          id: "guest-" + k + "-" + Date.now(),
          name: String(rg[0] || ""),
          group: String(rg[1] || "friends_both"),
          phone: String(rg[2] || ""),
          tableNumber: String(rg[3] || ""),
          invitationStatus: String(rg[4] || "confirmed"),
          plusGuests: Number(rg[5] || 0),
          isCheckedIn: String(rg[6]).toUpperCase().indexOf("CÓ MẶT") !== -1,
          checkInTime: String(rg[7] || ""),
          isVegetarian: String(rg[8]).toLowerCase() === "có",
          actualGift: Number(rg[9] || 0),
          notes: String(rg[10] || "")
        });
      }
    }

    // 4. Đọc Sheet Kế Hoạch Chuẩn Bị
    var sheetTasks = ss.getSheetByName("4. KeHoach_Timeline");
    if (sheetTasks && sheetTasks.getLastRow() > 1) {
      var rowsT = sheetTasks.getDataRange().getValues();
      for (var m = 1; m < rowsT.length; m++) {
        var rt = rowsT[m];
        if (!rt[1]) continue;
        result.tasks.push({
          id: "task-" + m + "-" + Date.now(),
          phase: String(rt[0] || "1-3months"),
          title: String(rt[1] || ""),
          dueDate: String(rt[2] || ""),
          isCompleted: String(rt[3]).toUpperCase().indexOf("HOÀN THÀNH") !== -1,
          assignee: String(rt[4] || "both"),
          priority: String(rt[5] || "medium"),
          category: String(rt[6] || "")
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
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

function formatGasDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = ("0" + (val.getMonth() + 1)).slice(-2);
    var d = ("0" + val.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  var s = String(val).trim();
  var match = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[0];
  var dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    var y = dt.getFullYear();
    var m = ("0" + (dt.getMonth() + 1)).slice(-2);
    var d = ("0" + dt.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  return s;
}

function formatGasTime(val) {
  if (!val) return "11:00";
  if (val instanceof Date) {
    var hh = ("0" + val.getHours()).slice(-2);
    var mm = ("0" + val.getMinutes()).slice(-2);
    return hh + ":" + mm;
  }
  var s = String(val).trim();
  var match = s.match(/(\d{1,2}):(\d{2})/);
  if (match) return ("0" + match[1]).slice(-2) + ":" + match[2];
  return s;
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
    // Dùng mode 'no-cors' để tránh việc trình duyệt di động (Android / iOS) chặn CORS redirect 302 của Google Apps Script
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Đã gửi dữ liệu đồng bộ lên Google Sheet thành công!',
    };
  } catch (error: any) {
    console.error('Google Sheets Sync error:', error);
    throw new Error(error.message || 'Lỗi kết nối đến Google Sheets. Hãy kiểm tra URL Webhook.');
  }
};

export const fetchFromGoogleSheets = async (
  webhookUrl: string
): Promise<{
  success: boolean;
  data?: Partial<WeddingFullData>;
  message: string;
  isOldScriptVersion?: boolean;
}> => {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('Vui lòng cấu hình Web App URL của Google Sheets trước.');
  }

  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl.startsWith('https://script.google.com/')) {
    throw new Error('Đường dẫn phải bắt đầu bằng https://script.google.com/...');
  }

  try {
    // Thêm timestamp ?_t=... để chống trình duyệt (nhất là mobile) cache lại dữ liệu cũ
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const noCacheUrl = `${cleanUrl}${separator}_t=${Date.now()}`;

    const response = await fetch(noCacheUrl, {
      method: 'GET',
    });

    const text = await response.text();

    // 1. Kiểm tra nếu Google trả về trang HTML (Yêu cầu đăng nhập hoặc sai quyền)
    if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('accounts.google.com')) {
      return {
        success: false,
        message: 'Google yêu cầu đăng nhập. Hãy mở Apps Script và chỉnh: "Ai có quyền truy cập: Bất kỳ ai (Anyone)" khi Triển khai.',
      };
    }

    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: 'Google Sheet không trả về JSON hợp lệ. Vui lòng kiểm tra lại Web App URL.',
      };
    }

    // 2. Phát hiện script đang chạy bản cũ (chỉ có doPost, doGet chỉ trả về { status: "online" })
    if (result && result.status === 'online' && !result.data) {
      return {
        success: false,
        isOldScriptVersion: true,
        message: 'Mã Google Apps Script trên Google Sheet của bạn đang là phiên bản cũ (v1 chưa có tính năng đọc dữ liệu). Hãy bấm "Sao Chép Code Mới" trong mục Google Sheet, dán vào Apps Script và chọn Triển khai mới để kích hoạt kéo dữ liệu 2 chiều!',
      };
    }

    // 3. Đọc dữ liệu thành công
    if (result && result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: 'Đã tải dữ liệu mới nhất từ Google Sheet thành công!',
      };
    }

    return {
      success: false,
      message: result?.error || result?.message || 'Không thể đọc dữ liệu từ Google Sheet.',
    };
  } catch (error: any) {
    console.error('Fetch Google Sheets error:', error);
    throw new Error(error.message || 'Lỗi tải dữ liệu từ Google Sheets.');
  }
};
