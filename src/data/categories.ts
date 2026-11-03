import { CategoryInfo, ExpenseCategory, GuestGroup, RSVPStatus, TaskPhase } from '../types/wedding';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'trap_le', name: 'Tráp Lễ & Ăn Hỏi', icon: 'Gift', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'nha_hang', name: 'Nhà Hàng & Tiệc Cưới', icon: 'Utensils', color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'trang_phuc', name: 'Váy Cưới & Trang Phục', icon: 'Shirt', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { id: 'chup_anh', name: 'Chụp Ảnh & Phóng Sự', icon: 'Camera', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'nhan_trang_suc', name: 'Nhẫn & Trang Sức', icon: 'Gem', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'trang_tri', name: 'Gia Tiên & Rạp Cưới', icon: 'Sparkles', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'thiep_cuoi', name: 'Thiệp Cưới & Quà Tặng', icon: 'Mail', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'xe_hoa', name: 'Xe Hoa & Di Chuyển', icon: 'Car', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'honeymoon', name: 'Tuần Trăng Mật', icon: 'Palmtree', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { id: 'phat_sinh', name: 'Chi Phí Dự Phòng', icon: 'Receipt', color: 'text-slate-600', bgColor: 'bg-slate-50' },
];

export const PHASE_LABELS: Record<TaskPhase, { title: string; subtitle: string }> = {
  phase_12m: { title: 'Trước 6 - 12 Tháng', subtitle: 'Lên ý tưởng, định hình ngân sách & chọn ngày' },
  phase_6m: { title: 'Trước 3 - 6 Tháng', subtitle: 'Đặt tiệc, trang phục, ảnh cưới & nhẫn' },
  phase_2m: { title: 'Trước 1 - 2 Tháng', subtitle: 'Gửi thiệp, chốt trang trí, xe hoa & kịch bản' },
  phase_1w: { title: 'Tuần Lễ Cưới', subtitle: 'Tổng duyệt, kiểm tra danh sách & thư giãn' },
  phase_day: { title: 'Ngày Trọng Đại', subtitle: 'Thực hiện nghi lễ & tận hưởng ngày hạnh phúc' },
};

export const GUEST_GROUP_LABELS: Record<GuestGroup, { label: string; color: string }> = {
  groom_side: { label: 'Họ Nhà Trai', color: 'bg-blue-100 text-blue-800' },
  bride_side: { label: 'Họ Nhà Gái', color: 'bg-pink-100 text-pink-800' },
  friends: { label: 'Bạn Bè', color: 'bg-emerald-100 text-emerald-800' },
  colleagues: { label: 'Đồng Nghiệp', color: 'bg-purple-100 text-purple-800' },
  relatives: { label: 'Bà Con / Khác', color: 'bg-amber-100 text-amber-800' },
};

export const RSVP_STATUS_LABELS: Record<RSVPStatus, { label: string; color: string }> = {
  not_sent: { label: 'Chưa gửi thiệp', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Đã gửi thiệp', color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Chắc chắn đi', color: 'bg-green-100 text-green-700' },
  declined: { label: 'Báo vắng', color: 'bg-rose-100 text-rose-700' },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatNumberInput = (value: number | string): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
};

export const parseNumberInput = (value: string): number => {
  const clean = value.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
};
