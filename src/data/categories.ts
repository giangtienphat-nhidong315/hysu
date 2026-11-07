import { CategoryInfo, ExpenseCategory, GuestGroup, GuestGroupItem, RSVPStatus, TaskPhase } from '../types/wedding';

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

export const DEFAULT_GUEST_GROUPS: GuestGroupItem[] = [
  { id: 'groom_paternal', name: 'Bên nội chú rể', color: 'bg-blue-100 text-blue-800', isDefault: true },
  { id: 'groom_maternal', name: 'Bên ngoại chú rể', color: 'bg-sky-100 text-sky-800', isDefault: true },
  { id: 'bride_paternal', name: 'Bên nội cô dâu', color: 'bg-rose-100 text-rose-800', isDefault: true },
  { id: 'bride_maternal', name: 'Bên ngoại cô dâu', color: 'bg-pink-100 text-pink-800', isDefault: true },
  { id: 'colleagues', name: 'Đồng nghiệp', color: 'bg-purple-100 text-purple-800', isDefault: true },
  { id: 'friends', name: 'Bạn bè', color: 'bg-emerald-100 text-emerald-800', isDefault: true },
  { id: 'groom_side', name: 'Họ Nhà Trai (chung)', color: 'bg-indigo-100 text-indigo-800', isDefault: true },
  { id: 'bride_side', name: 'Họ Nhà Gái (chung)', color: 'bg-amber-100 text-amber-800', isDefault: true },
  { id: 'relatives', name: 'Bà Con / Khác', color: 'bg-slate-100 text-slate-800', isDefault: true },
];

export const GUEST_GROUP_COLOR_OPTIONS = [
  { label: 'Xanh dương', value: 'bg-blue-100 text-blue-800', border: 'border-blue-400' },
  { label: 'Xanh da trời', value: 'bg-sky-100 text-sky-800', border: 'border-sky-400' },
  { label: 'Đỏ hồng', value: 'bg-rose-100 text-rose-800', border: 'border-rose-400' },
  { label: 'Hồng phấn', value: 'bg-pink-100 text-pink-800', border: 'border-pink-400' },
  { label: 'Tím mộng mơ', value: 'bg-purple-100 text-purple-800', border: 'border-purple-400' },
  { label: 'Xanh lục', value: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-400' },
  { label: 'Xanh mòng két', value: 'bg-teal-100 text-teal-800', border: 'border-teal-400' },
  { label: 'Vàng hổ phách', value: 'bg-amber-100 text-amber-800', border: 'border-amber-400' },
  { label: 'Cam ấm áp', value: 'bg-orange-100 text-orange-800', border: 'border-orange-400' },
  { label: 'Chàm thanh lịch', value: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-400' },
  { label: 'Xám trang nhã', value: 'bg-slate-100 text-slate-800', border: 'border-slate-400' },
];

export const GUEST_GROUP_LABELS: Record<string, { label: string; color: string }> = {
  groom_paternal: { label: 'Bên nội chú rể', color: 'bg-blue-100 text-blue-800' },
  groom_maternal: { label: 'Bên ngoại chú rể', color: 'bg-sky-100 text-sky-800' },
  bride_paternal: { label: 'Bên nội cô dâu', color: 'bg-rose-100 text-rose-800' },
  bride_maternal: { label: 'Bên ngoại cô dâu', color: 'bg-pink-100 text-pink-800' },
  groom_side: { label: 'Họ Nhà Trai (chung)', color: 'bg-indigo-100 text-indigo-800' },
  bride_side: { label: 'Họ Nhà Gái (chung)', color: 'bg-amber-100 text-amber-800' },
  friends: { label: 'Bạn Bè', color: 'bg-emerald-100 text-emerald-800' },
  colleagues: { label: 'Đồng Nghiệp', color: 'bg-purple-100 text-purple-800' },
  relatives: { label: 'Bà Con / Khác', color: 'bg-slate-100 text-slate-800' },
};

export const getGuestGroupInfo = (
  groupId: string,
  customGroups?: GuestGroupItem[]
): { label: string; color: string } => {
  if (customGroups && customGroups.length > 0) {
    const found = customGroups.find(
      g => g.id === groupId || g.name.toLowerCase() === (groupId || '').toLowerCase()
    );
    if (found) {
      return { label: found.name, color: found.color };
    }
  }
  if (GUEST_GROUP_LABELS[groupId]) {
    return GUEST_GROUP_LABELS[groupId];
  }
  return {
    label: groupId || 'Chưa phân nhóm',
    color: 'bg-slate-100 text-slate-700',
  };
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
