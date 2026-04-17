// --- New beautiful, smooth, tour guide style RoutePage ---
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../shared/ui/AppShell';
import { useAppStore } from '../../shared/store/appStore';
import {
  createMyTour,
  getMyTours,
  type TourVisibility,
  type UserTour,
} from '../../api/services/userTours';
import { getSavedTours } from '../../api/services/userSavedTours';
import {
  Plus, Map, Bookmark, Lock, Globe, Link2, Calendar, BookOpen,  Share, Search
} from 'lucide-react';

export default function RoutePage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const showToast = useAppStore((s) => s.showToast);

  const [myTours, setMyTours] = useState<UserTour[]>([]);
  const [savedTours, setSavedTours] = useState<UserTour[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'saved'>(params.get('tab') === 'saved' ? 'saved' : 'mine');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<TourVisibility>('PRIVATE');
  const [isCreating, setIsCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const [mine, saved] = await Promise.all([getMyTours(), getSavedTours()]);
      setMyTours(mine || []);
      setSavedTours(saved || []);
    } catch (err) {
      showToast({ title: 'Không thể tải danh sách tour' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const tours = activeTab === 'mine' ? myTours : savedTours;

  const filteredTours = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tours
      .filter(tour =>
        !q ||
        (tour.name?.toLowerCase().includes(q) ||
         tour.description?.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const aDate = a.updated_at || a.created_at || '2000-01-01';
        const bDate = b.updated_at || b.created_at || '2000-01-01';
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  }, [tours, searchQuery]);

  const handleCreateTour = async () => {
    if (!name.trim()) {
      showToast({ title: 'Vui lòng nhập tên tour' });
      return;
    }
    setIsCreating(true);
    try {
      await createMyTour({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      });
      showToast({ title: '✅ Đã tạo tour thành công' });
      setName('');
      setDescription('');
      loadTours();
    } catch (err) {
      showToast({ title: 'Tạo tour thất bại' });
    } finally {
      setIsCreating(false);
    }
  };

  const emptyMessage = activeTab === 'mine'
    ? 'Bạn chưa có lộ trình nào. Hãy tạo tour mới bên trên.'
    : 'Bạn chưa lưu tour nào. Hãy khám phá và lưu lại những tour yêu thích.';

  // --- UI Components ---
  function HeroCard({ tour }: { tour: UserTour }) {
    return (
      <div className="relative rounded-2xl p-6 bg-gradient-to-br from-orange-400 via-amber-300 to-orange-200 text-white overflow-hidden mb-6 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.15)_0px,transparent_1px,transparent_20px,rgba(255,255,255,0.15)_21px)] pointer-events-none" />
        <div className="absolute top-4 right-4 text-5xl opacity-80 select-none">🗺️</div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 w-fit mb-1">{tour.visibility === 'PUBLIC' ? '⭐ Công khai' : tour.visibility === 'PRIVATE' ? '🔒 Riêng tư' : '🔗 Không công khai'}</span>
          <h2 className="text-2xl font-extrabold mb-1 line-clamp-1">{tour.name || 'Tour không tên'}</h2>
          <div className="flex gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1"><Map className="w-4 h-4" /> {tour.poi_count || 0} điểm</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(tour.updated_at || tour.created_at || '2000-01-01').toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
    );
  }

  function TourCard({ tour }: { tour: UserTour }) {
    return (
      <div className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-lg border border-white/80 transition-all flex flex-col min-h-[210px] relative overflow-hidden">
        <HeroCard tour={tour} />
        <div className="flex-1">
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[44px] font-medium">{tour.description || 'Chưa có mô tả'}</p>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => nav(`/tourist/tours/${tour.id}`)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-400 text-white py-2.5 rounded-xl font-bold hover:from-orange-600 hover:to-amber-500 transition shadow group-hover:scale-[1.03] flex items-center justify-center gap-1"
          >
            <BookOpen className="w-4 h-4" /> Quản lý tour
          </button>
          <button
            onClick={() => nav(`/tourist/map?tourId=${tour.id}`)}
            className="flex-1 border border-gray-300 py-2.5 rounded-xl font-bold text-orange-600 hover:bg-orange-50 transition group-hover:scale-[1.03] flex items-center justify-center gap-1"
          >
            <Share className="w-4 h-4" /> Xem bản đồ
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 pb-28">
        {/* Header Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-6 py-2.5 font-semibold rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'mine'
                ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Map className="w-5 h-5" />
            Lộ trình của tôi
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-2.5 font-semibold rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            Tour đã lưu
          </button>
        </div>

        {/* Tạo tour mới - chỉ hiển thị khi ở tab "mine" */}
        {activeTab === 'mine' && (
          <div className="bg-white/80 rounded-3xl shadow-lg p-6 mb-8 border border-white/60 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 via-amber-100 to-sky-100 rounded-2xl flex items-center justify-center text-xl">
                <Plus className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-orange-700">Tạo tour mới</h2>
                <p className="text-sm text-gray-500">Xây dựng hành trình khám phá ẩm thực của riêng bạn</p>
              </div>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên tour (ví dụ: Hành trình phở Hà Nội)"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 font-semibold text-gray-800 bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Mô tả (tùy chọn)"
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y font-medium text-gray-700 bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 font-semibold text-gray-800 bg-white"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as TourVisibility)}
              >
                <option value="PRIVATE"> <Lock className="inline w-4 h-4 mr-1" /> Riêng tư - Chỉ mình tôi</option>
                <option value="PUBLIC"> <Globe className="inline w-4 h-4 mr-1" /> Công khai</option>
                <option value="UNLISTED"> <Link2 className="inline w-4 h-4 mr-1" /> Không công khai (có link)</option>
              </select>
              <button
                onClick={handleCreateTour}
                disabled={isCreating || !name.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md"
              >
                {isCreating ? 'Đang tạo...' : <><Plus className="w-5 h-5" /> Tạo tour ngay</>}
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm tour theo tên hoặc mô tả..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-4 top-3.5 text-gray-400"><Search className="w-5 h-5" /></span>
          </div>
          <span className="text-sm text-gray-500 self-center whitespace-nowrap">
            {filteredTours.length} tour
          </span>
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && !isLoading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-500 font-medium">{emptyMessage}</p>
          </div>
        )}

        {/* Tour List */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}