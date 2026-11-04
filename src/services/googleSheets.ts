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
  playlist?: import('../types/wedding').MusicItem[];
  clientTimestamp?: number;
  forceOverwrite?: boolean;
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
    var raw = "";
    if (e && e.postData && e.postData.contents) {
      raw = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      raw = e.parameter.data;
    }

    if (!raw) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Không nhận được nội dung dữ liệu (Empty payload)"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 0. Lưu bản sao lưu trước đó và cập nhật bản sao JSON nguyên bản vào Script Properties (bảo vệ hạn ngạch 9KB)
    try {
      if (raw && raw.length < 8500) {
        var oldBackup = PropertiesService.getScriptProperties().getProperty("HYSU_DATA_BACKUP");
        if (oldBackup) {
          PropertiesService.getScriptProperties().setProperty("HYSU_DATA_BACKUP_PREV", oldBackup);
        }
        PropertiesService.getScriptProperties().setProperty("HYSU_DATA_BACKUP", raw);
      }
      if (data.clientTimestamp) {
        PropertiesService.getScriptProperties().setProperty("HYSU_CLIENT_TS", String(data.clientTimestamp));
      }
    } catch (eProp) {
      // Bỏ qua lỗi vượt dung lượng thuộc tính để tiếp tục ghi trang tính
    }

    // KIỂM TRA BẢO VỆ DỮ LIỆU:
    // Nếu trên Sheet đã có dữ liệu thật (chú rể/cô dâu), mà dữ liệu gửi lên là dữ liệu mẫu "Quốc Bảo & Mai Linh" và không có forceOverwrite
    var sheetInfoCheck = findProfileSheet(ss);
    if (sheetInfoCheck) {
      var currentProf = parseProfileFromSheet(sheetInfoCheck);
      if (currentProf && currentProf.groomName && currentProf.groomName !== "Quốc Bảo" && data.profile && data.profile.groomName === "Quốc Bảo" && data.profile.brideName === "Mai Linh" && !data.forceOverwrite) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "BẢO VỆ DỮ LIỆU: Sheet đang chứa dữ liệu của chú rể '" + currentProf.groomName + "'. Thiết bị đang gửi dữ liệu mẫu mặc định (Quốc Bảo & Mai Linh). Đã tự động chặn ghi đè để bảo vệ dữ liệu trên Sheet của bạn! Vui lòng chọn 'Tải Dữ Liệu Từ Sheet Về Máy' trong ứng dụng."
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

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
    sheetGuests.appendRow(["Mã Khách", "Họ Và Tên", "Nhóm Khách", "Số Điện Thoại", "Bàn Tiệc", "Trạng Thái Thiệp", "Đi Cùng (+Người)", "Đã Đến Tiệc", "Giờ Đến", "Ăn Chay", "Tiền Mừng (VNĐ)", "Lời Chúc Mừng Cưới", "Ghi Chú"]);
    if (data.guests && data.guests.length > 0) {
      data.guests.forEach(function(g) {
        var rawCode = (g.code || "").toString().replace(/\D/g, "");
        var guestCode = rawCode ? ("00" + rawCode).slice(-3) : "";
        sheetGuests.appendRow([
          "'" + guestCode,
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
          g.wishes || "",
          g.notes || ""
        ]);
      });
    }
    formatHeader(sheetGuests, 13);

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
    var sheetCtr = getOrCreateSheet(ss, "5. HopDong_DichVu");
    sheetCtr.clear();
    sheetCtr.appendRow(["Tên Hợp Đồng", "Bên Cung Cấp", "Hạng Mục", "Ngày Ký", "Tổng Giá Trị (VNĐ)", "Đã Đặt Cọc (VNĐ)", "Còn Lại (VNĐ)", "Trạng Thái", "Số Ảnh Lưu", "SĐT", "Ghi Chú Điều Khoản"]);
    if (data.contracts && data.contracts.length > 0) {
      data.contracts.forEach(function(c) {
        var debt = Math.max(0, (c.contractValue || 0) - (c.depositValue || 0));
        var statusStr = c.status === "completed" ? "Hoàn thành" : (c.status === "cancelled" ? "Đã hủy" : "Đang thực hiện");
        sheetCtr.appendRow([
          c.title,
          c.vendorName,
          c.category,
          c.signedDate,
          c.contractValue || 0,
          c.depositValue || 0,
          debt,
          statusStr,
          c.images ? c.images.length : (c.imageCount || 0),
          c.vendorPhone || "",
          c.notes || ""
        ]);
      });
    }
    formatHeader(sheetCtr, 11);

    // 6. Sheet Danh Sách Nhạc Cưới (Playlist)
    if (data.playlist && data.playlist.length > 0) {
      var sheetMusic = getOrCreateSheet(ss, "6. NhacCuoi_Playlist");
      sheetMusic.clear();
      sheetMusic.appendRow(["Giai Đoạn Phát Nhạc", "Tên Bài Hát", "Nghệ Sĩ / Ca Sĩ", "Thời Lượng", "Link Nhạc (YouTube / Spotify)", "Trạng Thái Chuẩn Bị", "Ghi Chú"]);
      data.playlist.forEach(function(m) {
        var phaseName = m.phase === "welcome" ? "1. Đón khách"
          : (m.phase === "entrance" ? "2. Tiến lễ đường"
          : (m.phase === "ceremony" ? "3. Nghi thức lễ"
          : (m.phase === "dining" ? "4. Dùng tiệc"
          : (m.phase === "games" ? "5. Mini game / Bốc thăm"
          : (m.phase === "first_dance" ? "6. Khiêu vũ / Tiết mục"
          : (m.phase === "after_party" ? "7. Quẩy / After Party" : "8. Tiễn khách"))))));

        sheetMusic.appendRow([
          phaseName,
          m.title,
          m.artist,
          m.duration || "",
          m.link || "",
          m.isPrepared ? "ĐÃ CHUẨN BỊ" : "Chưa chuẩn bị",
          m.notes || ""
        ]);
      });
      formatHeader(sheetMusic, 7);
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result = {
      profile: null,
      expenses: [],
      guests: [],
      tasks: [],
      contracts: []
    };

    // 1. Đọc Sheet Thông Tin Ngày Cưới trực tiếp từ các ô tính (Nguồn chuẩn xác nhất)
    var sheetInfo = findProfileSheet(ss);
    if (sheetInfo) {
      result.profile = parseProfileFromSheet(sheetInfo);
    }

    // 2. Đọc Sheet Chi Tiêu
    var sheetExp = findSheet(ss, ["2. ChiTieu_NganSach", "2.ChiTieu_NganSach", "ChiTieu_NganSach", "Chi tiêu", "Chi tieu", "Expenses"]);
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
    var sheetGuests = findSheet(ss, ["3. KhachMoi_DiemDanh", "3.KhachMoi_DiemDanh", "KhachMoi_DiemDanh", "Khách mời", "Khach moi", "Điểm danh", "Guests"]);
    if (sheetGuests && sheetGuests.getLastRow() > 1) {
      var rowsG = sheetGuests.getDataRange().getValues();
      var hasCodeCol = String(rowsG[0][0]).toLowerCase().indexOf("mã") !== -1;
      var offset = hasCodeCol ? 1 : 0;
      for (var k = 1; k < rowsG.length; k++) {
        var rg = rowsG[k];
        var gName = String(rg[offset] || "");
        if (!gName) continue;
        var codeVal = hasCodeCol ? String(rg[0] || "").replace(/\D/g, "") : "";
        var wishesCol = rg.length > (offset + 10) ? String(rg[offset + 10] || "") : "";
        var notesCol = rg.length > (offset + 11) ? String(rg[offset + 11] || "") : String(rg[offset + 10] || "");
        result.guests.push({
          id: "guest-" + k + "-" + Date.now(),
          code: codeVal ? ("00" + codeVal).slice(-3) : ("00" + k).slice(-3),
          name: gName,
          group: String(rg[offset + 1] || "friends_both"),
          phone: String(rg[offset + 2] || ""),
          tableNumber: String(rg[offset + 3] || ""),
          invitationStatus: String(rg[offset + 4] || "confirmed"),
          plusGuests: Number(rg[offset + 5] || 0),
          isCheckedIn: String(rg[offset + 6]).toUpperCase().indexOf("CÓ MẶT") !== -1,
          checkInTime: String(rg[offset + 7] || ""),
          isVegetarian: String(rg[offset + 8]).toLowerCase() === "có",
          actualGift: Number(rg[offset + 9] || 0),
          wishes: wishesCol,
          notes: notesCol
        });
      }
    }

    // 4. Đọc Sheet Kế Hoạch Chuẩn Bị
    var sheetTasks = findSheet(ss, ["4. KeHoach_Timeline", "4.KeHoach_Timeline", "KeHoach_Timeline", "Kế hoạch", "Ke hoach", "Tasks"]);
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

    // 5. Đọc Sheet Hợp Đồng & Giấy Tờ
    var sheetCtr = findSheet(ss, ["5. HopDong_DichVu", "5.HopDong_DichVu", "HopDong_DichVu", "Hợp đồng", "Hop dong", "Contracts"]);
    if (sheetCtr && sheetCtr.getLastRow() > 1) {
      var rowsC = sheetCtr.getDataRange().getValues();
      for (var n = 1; n < rowsC.length; n++) {
        var rc = rowsC[n];
        if (!rc[0]) continue;
        var statusVal = "active";
        var rawStatus = String(rc[7] || "").toLowerCase();
        if (rawStatus.indexOf("hoàn thành") !== -1 || rawStatus === "completed") statusVal = "completed";
        if (rawStatus.indexOf("hủy") !== -1 || rawStatus === "cancelled") statusVal = "cancelled";

        result.contracts.push({
          id: "ctr-" + n + "-" + Date.now(),
          title: String(rc[0] || ""),
          vendorName: String(rc[1] || ""),
          category: String(rc[2] || "Nhà Hàng & Tiệc Cưới"),
          signedDate: formatGasDate(rc[3] || ""),
          contractValue: Number(rc[4] || 0),
          depositValue: Number(rc[5] || 0),
          status: statusVal,
          images: [],
          vendorPhone: String(rc[9] || rc[8] || ""),
          notes: String(rc[10] || rc[9] || "")
        });
      }
    }

    // 6. Hòa trộn dữ liệu sao lưu nguyên bản (nếu có) để lấy các trường bổ sung như ảnh hợp đồng
    var rawBackup = PropertiesService.getScriptProperties().getProperty("HYSU_DATA_BACKUP");
    if (rawBackup) {
      try {
        var parsedBackup = JSON.parse(rawBackup);
        if (parsedBackup) {
          // Nếu trên sheet không tìm thấy profile thì lấy profile từ bản backup
          if (!result.profile && parsedBackup.profile) {
            result.profile = parsedBackup.profile;
          } else if (result.profile && parsedBackup.profile) {
            // Giữ lại các trường bổ sung nếu sheet để trống
            if (!result.profile.groomName && parsedBackup.profile.groomName) result.profile.groomName = parsedBackup.profile.groomName;
            if (!result.profile.brideName && parsedBackup.profile.brideName) result.profile.brideName = parsedBackup.profile.brideName;
            if (!result.profile.weddingDate && parsedBackup.profile.weddingDate) result.profile.weddingDate = parsedBackup.profile.weddingDate;
            if (!result.profile.weddingTime && parsedBackup.profile.weddingTime) result.profile.weddingTime = parsedBackup.profile.weddingTime;
            if (!result.profile.venue && parsedBackup.profile.venue) result.profile.venue = parsedBackup.profile.venue;
            if (!result.profile.targetBudget && parsedBackup.profile.targetBudget) result.profile.targetBudget = parsedBackup.profile.targetBudget;
          }

          if (result.expenses.length === 0 && parsedBackup.expenses && parsedBackup.expenses.length > 0) {
            result.expenses = parsedBackup.expenses;
          }
          if (result.guests.length === 0 && parsedBackup.guests && parsedBackup.guests.length > 0) {
            result.guests = parsedBackup.guests;
          }
          if (result.tasks.length === 0 && parsedBackup.tasks && parsedBackup.tasks.length > 0) {
            result.tasks = parsedBackup.tasks;
          }
          if (parsedBackup.schedule && parsedBackup.schedule.length > 0) {
            result.schedule = parsedBackup.schedule;
          }
          if (parsedBackup.vendors && parsedBackup.vendors.length > 0) {
            result.vendors = parsedBackup.vendors;
          }
          if (parsedBackup.playlist && parsedBackup.playlist.length > 0) {
            result.playlist = parsedBackup.playlist;
          }
          // Ghép lại mảng ảnh hợp đồng nếu có trong backup
          if (parsedBackup.contracts && parsedBackup.contracts.length > 0) {
            if (result.contracts.length === 0) {
              result.contracts = parsedBackup.contracts;
            } else {
              result.contracts.forEach(function(ctr, idx) {
                if (parsedBackup.contracts[idx] && parsedBackup.contracts[idx].images) {
                  ctr.images = parsedBackup.contracts[idx].images;
                }
              });
            }
          }
        }
      } catch (errBackup) {}
    }

    var clientTs = PropertiesService.getScriptProperties().getProperty("HYSU_CLIENT_TS");
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      clientTimestamp: clientTs ? Number(clientTs) : Date.now(),
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

function findSheet(ss, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var s = ss.getSheetByName(candidates[i]);
    if (s) return s;
  }
  var sheets = ss.getSheets();
  for (var j = 0; j < sheets.length; j++) {
    var name = sheets[j].getName().toLowerCase().replace(/[^a-z0-9]/g, "");
    for (var k = 0; k < candidates.length; k++) {
      var cand = candidates[k].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (name.indexOf(cand) !== -1 || cand.indexOf(name) !== -1) {
        return sheets[j];
      }
    }
  }
  return null;
}

function findProfileSheet(ss) {
  var candidates = [
    "1. ThongTinNgayCuoi", "1.ThongTinNgayCuoi", "ThongTinNgayCuoi",
    "Thông Tin Ngày Cưới", "Thông tin ngày cưới", "Thong Tin Ngay Cuoi",
    "Thông tin", "Thong tin", "Cô dâu chú rể", "Co dau chu re",
    "Cặp đôi", "Cap doi", "Profile"
  ];
  var sheet = findSheet(ss, candidates);
  if (sheet) return sheet;

  // Quét toàn bộ các trang tính trong file để tìm trang chứa từ khóa "chú rể" hoặc "cô dâu"
  var allSheets = ss.getSheets();
  for (var s = 0; s < allSheets.length; s++) {
    var sh = allSheets[s];
    var range = sh.getDataRange();
    if (!range) continue;
    var vals = range.getValues();
    for (var r = 0; r < Math.min(vals.length, 25); r++) {
      for (var c = 0; c < Math.min(vals[r].length, 12); c++) {
        var str = String(vals[r][c] || "").toLowerCase();
        if (str.indexOf("chú rể") !== -1 || str.indexOf("chu re") !== -1 || str.indexOf("cô dâu") !== -1 || str.indexOf("co dau") !== -1) {
          return sh;
        }
      }
    }
  }
  return allSheets.length > 0 ? allSheets[0] : null;
}

function parseProfileFromSheet(sheetInfo) {
  if (!sheetInfo) return null;
  var rowsInfo = sheetInfo.getDataRange().getValues();
  if (!rowsInfo || rowsInfo.length === 0) return null;

  var prof = {
    groomName: "",
    brideName: "",
    weddingDate: "",
    weddingTime: "",
    venue: "",
    targetBudget: 0
  };

  for (var r = 0; r < rowsInfo.length; r++) {
    for (var c = 0; c < rowsInfo[r].length; c++) {
      var key = String(rowsInfo[r][c] || "").trim().toLowerCase();
      if (!key) continue;

      // Tìm giá trị ở các cột bên phải cùng hàng r
      var val = "";
      for (var nc = c + 1; nc < rowsInfo[r].length; nc++) {
        if (rowsInfo[r][nc] !== "" && rowsInfo[r][nc] !== undefined && rowsInfo[r][nc] !== null) {
          val = rowsInfo[r][nc];
          break;
        }
      }
      // Tìm giá trị ở hàng dưới cùng cột c (bảng dạng cột)
      var valBelow = (r + 1 < rowsInfo.length && rowsInfo[r+1][c] !== "" && rowsInfo[r+1][c] !== undefined) ? rowsInfo[r+1][c] : "";

      // Chú Rể
      if ((key.indexOf("chú rể") !== -1 || key.indexOf("chu re") !== -1 || key === "groom" || key.indexOf("tên chú rể") !== -1 || key.indexOf("nhà trai") !== -1) && key.indexOf("cô dâu") === -1) {
        var gVal = String(val || valBelow || "").trim();
        if (gVal && !prof.groomName && gVal !== "MỤC" && gVal !== "THÔNG TIN CHI TIẾT") {
          prof.groomName = gVal;
        }
      }
      // Cô Dâu
      if ((key.indexOf("cô dâu") !== -1 || key.indexOf("co dau") !== -1 || key === "bride" || key.indexOf("tên cô dâu") !== -1 || key.indexOf("nhà gái") !== -1) && key.indexOf("chú rể") === -1) {
        var bVal = String(val || valBelow || "").trim();
        if (bVal && !prof.brideName && bVal !== "MỤC" && bVal !== "THÔNG TIN CHI TIẾT") {
          prof.brideName = bVal;
        }
      }
      // Ngày Cưới
      if (key.indexOf("ngày cưới") !== -1 || key.indexOf("ngay cuoi") !== -1 || key === "date" || key.indexOf("ngày hôn lễ") !== -1 || key.indexOf("ngày tổ chức") !== -1) {
        var dVal = formatGasDate(val || valBelow);
        if (dVal && !prof.weddingDate) prof.weddingDate = dVal;
      }
      // Giờ Cử Hành
      if ((key.indexOf("giờ") !== -1 || key.indexOf("gio") !== -1 || key === "time") && key.indexOf("ngày") === -1) {
        var tVal = formatGasTime(val || valBelow);
        if (tVal && !prof.weddingTime) prof.weddingTime = tVal;
      }
      // Địa Điểm
      if (key.indexOf("địa điểm") !== -1 || key.indexOf("dia diem") !== -1 || key.indexOf("venue") !== -1 || key.indexOf("nhà hàng") !== -1 || key.indexOf("nơi tổ chức") !== -1) {
        var vVal = String(val || valBelow || "").trim();
        if (vVal && !prof.venue) prof.venue = vVal;
      }
      // Ngân Sách
      if (key.indexOf("ngân sách") !== -1 || key.indexOf("ngan sach") !== -1 || key.indexOf("budget") !== -1) {
        var budVal = Number(val || valBelow || 0);
        if (budVal && !prof.targetBudget) prof.targetBudget = budVal;
      }
    }
  }

  // Quét ghép nếu chú rể và cô dâu nằm chung 1 ô (vd: "Quốc Bảo & Mai Linh" hoặc "Quốc Bảo và Mai Linh")
  if (!prof.groomName || !prof.brideName) {
    for (var cr = 0; cr < rowsInfo.length; cr++) {
      for (var cc = 0; cc < rowsInfo[cr].length; cc++) {
        var cellText = String(rowsInfo[cr][cc] || "").trim();
        if (cellText.indexOf("&") !== -1 || cellText.toLowerCase().indexOf(" và ") !== -1) {
          var parts = cellText.indexOf("&") !== -1 ? cellText.split("&") : cellText.split(/ và /i);
          if (parts.length === 2) {
            var p0 = parts[0].replace(/cô dâu|chú rể|hỷ sự|đám cưới|tiệc cưới|wedding/gi, "").trim();
            var p1 = parts[1].replace(/cô dâu|chú rể|hỷ sự|đám cưới|tiệc cưới|wedding/gi, "").trim();
            if (p0.length > 1 && p1.length > 1 && !prof.groomName && !prof.brideName) {
              prof.groomName = p0;
              prof.brideName = p1;
            }
          }
        }
      }
    }
  }

  if (prof.groomName || prof.brideName) {
    return prof;
  }
  return null;
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
  var matchYMD = s.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (matchYMD) {
    return matchYMD[1] + "-" + ("0" + matchYMD[2]).slice(-2) + "-" + ("0" + matchYMD[3]).slice(-2);
  }
  var matchDMY = s.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (matchDMY) {
    return matchDMY[3] + "-" + ("0" + matchDMY[2]).slice(-2) + "-" + ("0" + matchDMY[1]).slice(-2);
  }
  var dt = new Date(s);
  if (!isNaN(dt.getTime()) && dt.getFullYear() > 1900) {
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
  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    throw new Error('Đường dẫn bạn vừa nhập là link bảng tính (docs.google.com). Vui lòng dùng Web App URL (bắt đầu bằng https://script.google.com/...) được cấp sau khi Triển khai Apps Script.');
  }
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
