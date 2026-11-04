export type ExpenseCategory = 
  | 'trap_le'
  | 'nha_hang'
  | 'trang_phuc'
  | 'chup_anh'
  | 'nhan_trang_suc'
  | 'trang_tri'
  | 'thiep_cuoi'
  | 'xe_hoa'
  | 'honeymoon'
  | 'phat_sinh';

export interface CategoryInfo {
  id: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export type PaymentStatus = 'not_paid' | 'deposit' | 'paid';
export type PayerType = 'both' | 'groom' | 'bride';

export interface ExpenseItem {
  id: string;
  categoryId: ExpenseCategory;
  title: string;
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  payer: PayerType;
  status: PaymentStatus;
  notes?: string;
  date?: string;
  vendorPhone?: string;
}

export type TaskPhase = 
  | 'phase_12m' // Trước 6 - 12 tháng
  | 'phase_6m'  // Trước 3 - 6 tháng
  | 'phase_2m'  // Trước 1 - 2 tháng
  | 'phase_1w'  // Tuần lễ cưới
  | 'phase_day'; // Ngày cưới

export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  phase: TaskPhase;
  dueDate: string;
  isCompleted: boolean;
  assignee: PayerType;
  priority: TaskPriority;
  category?: string;
}

export type GuestGroup = 'groom_side' | 'bride_side' | 'friends' | 'colleagues' | 'relatives';
export type RSVPStatus = 'not_sent' | 'sent' | 'confirmed' | 'declined';

export interface GuestItem {
  id: string;
  code?: string; // Mã định danh thứ tự (ví dụ: KH-001, KH-002)
  name: string;
  phone?: string;
  group: GuestGroup;
  invitationStatus: RSVPStatus;
  tableNumber?: string;
  estimatedGift?: number;
  actualGift?: number;
  notes?: string;
  plusGuests?: number; // Số người lớn đi cùng (vd: 1 người, 2 người)
  hasKids?: boolean; // Có trẻ em đi cùng
  kidsCount?: number; // Số trẻ em đi cùng
  isCheckedIn?: boolean; // Đã đến tiệc
  checkInTime?: string; // Giờ check-in
  isVegetarian?: boolean; // Suất ăn chay
  wishes?: string; // Lời chúc mừng cưới từ khách
  luckyNumber?: string; // Mã số may mắn tham gia mini game / bốc thăm
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  phone: string;
  address?: string;
  contractAmount: number;
  depositAmount: number;
  notes?: string;
}

export interface ContractItem {
  id: string;
  title: string;
  vendorName: string;
  category: string;
  signedDate: string;
  contractValue: number;
  depositValue: number;
  vendorPhone?: string;
  notes?: string;
  images: string[]; // Base64 data URLs of contract photos
  status: 'active' | 'completed' | 'cancelled';
}

export interface DayScheduleItem {
  id: string;
  time: string;
  eventName: string;
  description?: string;
  personInCharge?: string;
  location?: string;
  isDone?: boolean;
}

export type MusicPhase =
  | 'welcome'     // Đón khách (Background, Acoustic, Lãng mạn)
  | 'entrance'    // Chú rể & Cô dâu tiến vào lễ đường (Grand Entrance)
  | 'ceremony'    // Cắt bánh, rót rượu, trao nhẫn
  | 'dining'      // Nhạc nền khi dùng tiệc (Dịu dàng, vui tươi)
  | 'games'       // Mini game, Bốc thăm trúng thưởng (Sôi động, hào hứng)
  | 'first_dance' // Điệu nhảy đầu tiên / Tiết mục đặc biệt
  | 'after_party' // Nhạc quẩy / After party
  | 'farewell';   // Tiễn khách ra về

export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  phase: MusicPhase;
  link?: string; // YouTube, Spotify hoặc Zing MP3
  notes?: string;
  duration?: string;
  isPrepared?: boolean; // Đã sẵn sàng / đã test file
}

export interface CoupleProfile {
  groomName: string;
  brideName: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // HH:mm
  venue: string;
  targetBudget: number;
  coverImage?: string;
  // Cài đặt thiệp hồng & trang khách mời
  musicUrl?: string; // Link bài hát nhạc nền thiệp cưới (file mp3 / link trực tiếp)
  musicTitle?: string; // Tên bài hát hiển thị
  albumImages?: string[]; // Danh sách link ảnh cưới cho album slide
  invitationMessage?: string; // Lời ngỏ thiệp hồng chào mừng khách
}

export interface GoogleSheetConfig {
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastStatus?: 'success' | 'error' | 'idle' | 'syncing';
  lastMessage?: string;
}
