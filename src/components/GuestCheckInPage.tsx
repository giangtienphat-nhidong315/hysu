import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Send,
  Ticket,
  UtensilsCrossed,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { GuestItem } from '../types/wedding';

export const GuestCheckInPage: React.FC = () => {
  const { profile, selfCheckInGuest, triggerConfetti } = useWedding();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wishes: '',
    plusGuests: 0,
    isVegetarian: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedInResult, setCheckedInResult] = useState<{
    guest: GuestItem;
    isExisting: boolean;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    try {
      const result = selfCheckInGuest({
        name: formData.name,
        phone: formData.phone,
        wishes: formData.wishes,
        isVegetarian: formData.isVegetarian,
        plusGuests: formData.plusGuests,
      });

      setCheckedInResult({
        guest: result.guest,
        isExisting: result.isExisting,
      });
      triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleWishes = [
    'Trăm năm hạnh phúc, đầu bạc răng long! ❤️',
    'Chúc hai bạn luôn yêu thương và thấu hiểu nhau!',
    'Hôn nhân viên mãn, sớm đón thiên thần nhỏ nhé! 👶',
    'Chúc mừng ngày trọng đại của hai bạn! 🎉',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/40 to-slate-50 flex flex-col justify-between py-6 px-4 font-sans text-slate-800">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Banner Thiệp Cưới Sang Trọng */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-rose-100 text-rose-600 rounded-full mb-3 shadow-inner">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
          </div>

          <p className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
            Mừng Ngày Chung Đôi
          </p>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {profile.groomName} <span className="text-rose-500 font-serif italic font-normal">&</span> {profile.brideName}
          </h1>

          {/* Ngày cưới & Địa điểm tóm tắt */}
          <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-medium mt-2 flex-wrap">
            {profile.weddingDate && (
              <span className="flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-rose-200/60 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{profile.weddingDate}</span>
              </span>
            )}
            {profile.weddingTime && (
              <span className="flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-rose-200/60 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>{profile.weddingTime}</span>
              </span>
            )}
            {profile.venue && (
              <span className="flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-rose-200/60 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="truncate max-w-[160px]">{profile.venue}</span>
              </span>
            )}
          </div>
        </div>

        {/* THÀNH CÔNG: Hiển thị Thẻ Bốc Thăm & Mã Số May Mắn */}
        {checkedInResult ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-rose-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Điểm Danh Thành Công!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Cảm ơn <b>{checkedInResult.guest.name}</b> đã đến chung vui cùng gia đình chúng tôi!
              </p>
            </div>

            {/* Thẻ Vé May Mắn Nhận Thưởng Mini Game */}
            <div className="bg-gradient-to-br from-amber-500 via-rose-500 to-pink-600 p-0.5 rounded-2xl shadow-lg">
              <div className="bg-white rounded-[15px] p-5 text-center relative overflow-hidden">
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 block mb-1">
                  MÃ SỐ BỐC THĂM MAY MẮN
                </span>

                <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-wider my-2">
                  #{checkedInResult.guest.luckyNumber || checkedInResult.guest.code}
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  Hãy giữ mã số này để tham gia phần <b>Bốc Thăm Trúng Thưởng / Mini Game</b> diễn ra trong buổi tiệc!
                </p>

                {checkedInResult.guest.tableNumber && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700">
                    <span>Vị trí bàn tiệc của bạn:</span>
                    <span className="bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {checkedInResult.guest.tableNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {checkedInResult.guest.wishes && (
              <div className="bg-rose-50/70 p-3 rounded-2xl text-left border border-rose-100">
                <span className="text-[10px] font-bold text-rose-500 block mb-0.5">
                  💌 Lời chúc của bạn gửi đến đôi uyên ương:
                </span>
                <p className="text-xs text-slate-700 italic">"{checkedInResult.guest.wishes}"</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCheckedInResult(null);
                setFormData({
                  name: '',
                  phone: '',
                  wishes: '',
                  plusGuests: 0,
                  isVegetarian: false,
                });
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
            >
              Điểm danh thêm người khác
            </button>
          </div>
        ) : (
          /* FORM ĐIỀN THÔNG TIN ĐIỂM DANH */
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-rose-100">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Tự Điểm Danh & Nhận Mã May Mắn
                </h2>
                <p className="text-[11px] text-slate-500">
                  Dành cho khách tham dự tiệc cưới • Bốc thăm quà tặng hấp dẫn
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Tên khách mời */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Họ và tên của bạn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A (Bạn chú rể)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Số điện thoại <span className="text-slate-400 font-normal">(để đối soát quà trúng thưởng)</span>
                </label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Đi cùng & Ăn chay */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đi cùng (+Người)</span>
                  </label>
                  <select
                    value={formData.plusGuests}
                    onChange={e => setFormData({ ...formData, plusGuests: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                  >
                    <option value={0}>Đi 1 mình</option>
                    <option value={1}>Đi 2 người (+1)</option>
                    <option value={2}>Đi 3 người (+2)</option>
                    <option value={3}>Đi 4 người (+3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                    <span>Khẩu phần</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVegetarian: !formData.isVegetarian })}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                      formData.isVegetarian
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {formData.isVegetarian ? '🌱 Suất Ăn Chay' : '🍖 Suất Tiệc Mặn'}
                  </button>
                </div>
              </div>

              {/* Lời chúc mừng */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Gửi lời chúc mừng đến cô dâu & chú rể
                </label>
                <textarea
                  rows={3}
                  placeholder="Gửi gắm những lời chúc ngọt ngào nhất..."
                  value={formData.wishes}
                  onChange={e => setFormData({ ...formData, wishes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />

                {/* Gợi ý lời chúc nhanh */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {sampleWishes.map((txt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, wishes: txt })}
                      className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200/60 transition"
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="w-full mt-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc & Nhận Mã May Mắn'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 pb-4">
          Hỷ Sự • Trân trọng từng khoảnh khắc đáng nhớ trong ngày cưới
        </div>
      </div>
    </div>
  );
};