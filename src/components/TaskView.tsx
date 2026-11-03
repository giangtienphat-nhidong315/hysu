import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { PHASE_LABELS } from '../data/categories';
import { PayerType, TaskItem, TaskPhase, TaskPriority } from '../types/wedding';

interface TaskViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ isAddModalOpen, setIsAddModalOpen }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useWedding();

  const [activePhase, setActivePhase] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    phase: 'phase_2m' as TaskPhase,
    dueDate: new Date().toISOString().split('T')[0],
    assignee: 'both' as PayerType,
    priority: 'high' as TaskPriority,
    category: 'Chuẩn bị',
  });

  const phases: TaskPhase[] = ['phase_12m', 'phase_6m', 'phase_2m', 'phase_1w', 'phase_day'];

  const openAddModal = (defaultPhase?: TaskPhase) => {
    setEditingTask(null);
    setFormData({
      title: '',
      phase: defaultPhase || 'phase_2m',
      dueDate: new Date().toISOString().split('T')[0],
      assignee: 'both',
      priority: 'high',
      category: 'Chuẩn bị',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      phase: task.phase,
      dueDate: task.dueDate,
      assignee: task.assignee,
      priority: task.priority,
      category: task.category || 'Chuẩn bị',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title,
        phase: formData.phase,
        dueDate: formData.dueDate,
        assignee: formData.assignee,
        priority: formData.priority,
        category: formData.category,
      });
    } else {
      addTask({
        title: formData.title,
        phase: formData.phase,
        dueDate: formData.dueDate,
        isCompleted: false,
        assignee: formData.assignee,
        priority: formData.priority,
        category: formData.category,
      });
    }

    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesPhase = activePhase === 'all' || t.phase === activePhase;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !t.isCompleted) ||
      (filterStatus === 'completed' && t.isCompleted);
    return matchesPhase && matchesStatus;
  });

  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="space-y-4 pb-24 px-4 pt-1">
      {/* Header Progress Card */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-3xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs text-rose-100 font-medium">Lộ trình chuẩn bị</span>
            <h2 className="text-xl font-bold">Kế Hoạch & Việc Cần Làm</h2>
          </div>
          <span className="text-2xl font-black bg-white/20 px-3 py-1 rounded-2xl backdrop-blur-sm">
            {doneCount}/{totalCount}
          </span>
        </div>
        <p className="text-xs text-rose-100 mb-2">
          Đã hoàn thành {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}% các hạng mục cần chuẩn bị
        </p>
        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Action and Filter Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : ''
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'pending' ? 'bg-white text-slate-900 shadow-xs' : ''
            }`}
          >
            Chưa làm
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'completed' ? 'bg-white text-slate-900 shadow-xs' : ''
            }`}
          >
            Đã xong
          </button>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Việc</span>
        </button>
      </div>

      {/* Phase Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActivePhase('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
            activePhase === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toàn bộ lộ trình
        </button>
        {phases.map(ph => {
          const phCount = tasks.filter(t => t.phase === ph).length;
          const phDone = tasks.filter(t => t.phase === ph && t.isCompleted).length;
          return (
            <button
              key={ph}
              onClick={() => setActivePhase(ph)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                activePhase === ph
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{PHASE_LABELS[ph].title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activePhase === ph ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {phDone}/{phCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Task List by Phase */}
      <div className="space-y-4">
        {phases.map(ph => {
          if (activePhase !== 'all' && activePhase !== ph) return null;

          const phaseTasks = filteredTasks.filter(t => t.phase === ph);
          if (phaseTasks.length === 0 && activePhase !== 'all') {
            return (
              <div key={ph} className="bg-white rounded-3xl p-6 text-center border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Không có công việc nào trong giai đoạn này.</p>
              </div>
            );
          }
          if (phaseTasks.length === 0) return null;

          return (
            <div key={ph} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {PHASE_LABELS[ph].title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{PHASE_LABELS[ph].subtitle}</p>
                </div>
                <button
                  onClick={() => openAddModal(ph)}
                  className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm việc
                </button>
              </div>

              <div className="space-y-2">
                {phaseTasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl p-3 border transition flex items-start gap-3 shadow-xs ${
                      task.isCompleted
                        ? 'border-emerald-100 bg-emerald-50/20 opacity-75'
                        : 'border-slate-100 hover:border-rose-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.category && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                            {task.category}
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" /> Gấp
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {task.assignee === 'groom' ? 'Chú rể' : task.assignee === 'bride' ? 'Cô dâu' : 'Cả hai'}
                        </span>
                      </div>

                      <p
                        className={`text-xs mt-1 leading-snug break-words ${
                          task.isCompleted
                            ? 'line-through text-slate-400'
                            : 'font-semibold text-slate-800'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Hạn hoàn thành: {task.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Xác nhận xóa công việc này?')) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Task Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-900">
                {editingTask ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc Mới'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="task-modal-form"
                  className="sm:hidden px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
                >
                  {editingTask ? 'Lưu' : 'Thêm'}
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form id="task-modal-form" onSubmit={handleSaveTask} className="modal-form-wrapper">
              <div className="modal-scroll-area space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nội dung công việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đặt in 300 thiệp cưới, Thử hoa cầm tay..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Giai đoạn chuẩn bị</label>
                <select
                  value={formData.phase}
                  onChange={e => setFormData({ ...formData, phase: e.target.value as TaskPhase })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {phases.map(ph => (
                    <option key={ph} value={ph}>
                      {PHASE_LABELS[ph].title} - {PHASE_LABELS[ph].subtitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mức độ ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="high">🔴 Rất gấp & quan trọng</option>
                    <option value="medium">🟡 Bình thường</option>
                    <option value="low">🟢 Không gấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Người phụ trách chính</label>
                  <select
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value as PayerType })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="both">Cả hai cùng làm</option>
                    <option value="groom">Chú rể</option>
                    <option value="bride">Cô dâu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nhãn phân loại</label>
                  <input
                    type="text"
                    placeholder="Trang phục, Nhà hàng, Nghi lễ..."
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold border border-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-md transition active:scale-95"
              >
                {editingTask ? 'Lưu Thay Đổi' : 'Thêm Công Việc'}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};
