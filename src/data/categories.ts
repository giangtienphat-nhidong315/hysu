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

export const MUSIC_PHASE_LABELS: Record<
  import('../types/wedding').MusicPhase,
  { label: string; icon: string; description: string; color: string; bgColor: string }
> = {
  welcome: {
    label: 'Đón Khách',
    icon: 'Sparkles',
    description: 'Nhạc nhẹ nhàng, Acoustic hoặc Lofi lãng mạn khi đón khách',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  entrance: {
    label: 'Tiến Lễ Đường',
    icon: 'Heart',
    description: 'Khoảnh khắc thiêng liêng khi Chú rể & Cô dâu bước vào lễ đường',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  ceremony: {
    label: 'Nghi Thức Lễ',
    icon: 'Gem',
    description: 'Trao nhẫn, rót rượu mừng, cắt bánh kem cưới',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200',
  },
  dining: {
    label: 'Dùng Tiệc',
    icon: 'Utensils',
    description: 'Nhạc nền vui tươi, êm dịu trong lúc khách dùng bữa',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  games: {
    label: 'Mini Game / Bốc Thăm',
    icon: 'PartyPopper',
    description: 'Nhạc sôi động, hào hứng khi tổ chức trò chơi giao lưu',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
  },
  first_dance: {
    label: 'Khiêu Vũ / Tiết Mục',
    icon: 'Music',
    description: 'Điệu nhảy đầu tiên của cặp đôi hoặc bài hát đặc biệt',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  after_party: {
    label: 'Quẩy / After Party',
    icon: 'Zap',
    description: 'Nhạc Remix, EDM, quẩy hết mình cùng hội bạn thân',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
  farewell: {
    label: 'Tiễn Khách',
    icon: 'Smile',
    description: 'Nhạc ấm áp, cảm ơn khách mời trước khi ra về',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
  },
};

export const DEFAULT_WEDDING_PLAYLIST: Omit<import('../types/wedding').MusicItem, 'id'>[] = [
  {
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    phase: 'entrance',
    duration: '4:45',
    link: 'https://www.youtube.com/watch?v=rtOvBOTyX00',
    notes: 'Bài hát huyền thoại khi cô dâu bước vào lễ đường',
    isPrepared: true,
  },
  {
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    phase: 'entrance',
    duration: '2:57',
    link: 'https://www.youtube.com/watch?v=GxldQ9GyXfY',
    notes: 'Giai điệu cổ điển, ngọt ngào và lãng mạn',
    isPrepared: true,
  },
  {
    title: 'Ngày Đầu Tiên',
    artist: 'Đức Phúc',
    phase: 'ceremony',
    duration: '3:30',
    link: 'https://www.youtube.com/watch?v=fJ1Gv0Cq1xY',
    notes: 'Phù hợp khi trao nhẫn và nâng ly chúc mừng',
    isPrepared: true,
  },
  {
    title: 'Cưới Thôi',
    artist: 'Masiu x Masew',
    phase: 'ceremony',
    duration: '3:05',
    notes: 'Nhạc vui tươi chúc phúc',
    isPrepared: true,
  },
  {
    title: 'Can’t Take My Eyes Off You',
    artist: 'Frankie Valli',
    phase: 'welcome',
    duration: '3:20',
    notes: 'Acoustic / Jazz nhẹ nhàng đón khách vào sảnh tiệc',
    isPrepared: true,
  },
  {
    title: 'Sugar',
    artist: 'Maroon 5',
    phase: 'games',
    duration: '3:55',
    notes: 'Nhạc sôi động cực kỳ kích thích không khí mini game',
    isPrepared: true,
  },
  {
    title: 'Ánh Nắng Của Anh',
    artist: 'Đức Phúc',
    phase: 'dining',
    duration: '4:15',
    notes: 'Nhạc nền tình cảm, êm đềm khi dùng tiệc',
    isPrepared: true,
  },
];
