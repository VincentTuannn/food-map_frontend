// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { AppShell } from '../../shared/ui/AppShell';
// import { useAppStore } from '../../shared/store/appStore';
// import QRCode from '../../shared/ui/QRCode';
// import {
//   createMyTour,
//   deleteMyTour,
//   getMyTours,
//   type TourVisibility,
//   type UserTour,
// } from '../../api/services/userTours';
// import { getSavedTours } from '../../api/services/userSavedTours';

// export default function RoutePage() {
//   const nav = useNavigate();
//   const [params] = useSearchParams();
//   const showToast = useAppStore((s) => s.showToast);

//   const [myTours, setMyTours] = useState<UserTour[]>([]);
//   const [savedTours, setSavedTours] = useState<UserTour[]>([]);
//   const [tab, setTab] = useState<'mine' | 'saved'>(params.get('tab') === 'saved' ? 'saved' : 'mine');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [visibility, setVisibility] = useState<TourVisibility>('PRIVATE');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [visibilityFilter, setVisibilityFilter] = useState<'all' | TourVisibility>('all');
//   const [sortKey, setSortKey] = useState<'updated' | 'name'>('updated');
//   const [previewId, setPreviewId] = useState<string | null>(null);

//   const tours = tab === 'mine' ? myTours : savedTours;

//   const loadTours = () => {
//     setIsLoading(true);
//     Promise.all([getMyTours(), getSavedTours()])
//       .then(([mine, saved]) => {
//         setMyTours(mine || []);
//         setSavedTours(saved || []);
//       })
//       .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
//       .finally(() => setIsLoading(false));
//   };

//   useEffect(() => {
//     loadTours();
//     // eslint-disable-next-line
//   }, []);

//   const shareLink = (tour: UserTour) => {
//     const token = tour.share_token ?? tour.shareToken;
//     if (!token) return '';
//     return `${window.location.origin}/tour/shared/${token}`;
//   };

//   const openMapForTour = (tour: UserTour, scope: 'mine' | 'saved', autoNav = false) => {
//     const params = new URLSearchParams();
//     params.set('tourId', tour.id);
//     params.set('tourScope', scope);
//     if (tour.name) params.set('tourName', tour.name);
//     if (autoNav) params.set('nav', 'true');
//     nav(`/tourist/map?${params.toString()}`);
//   };

//   const handleCreate = async () => {
//     if (!name.trim()) {
//       showToast({ title: 'Vui lòng nhập tên tour' });
//       return;
//     }
//     setIsSaving(true);
//     try {
//       await createMyTour({ name: name.trim(), description: description.trim() || undefined, visibility });
//       setName('');
//       setDescription('');
//       setVisibility('PRIVATE');
//       loadTours();
//       showToast({ title: '✨ Đã tạo tour thành công' });
//     } catch {
//       showToast({ title: 'Tạo tour thất bại' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const emptyState = useMemo(() => {
//     if (tab === 'mine') return 'Bạn chưa có tour nào. Hãy tạo tour mới bên trên.';
//     return 'Bạn chưa lưu tour nào. Hãy khám phá và lưu lại những tour yêu thích.';
//   }, [tab]);

//   const filteredTours = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     const filtered = tours.filter((tour) => {
//       if (visibilityFilter !== 'all' && tour.visibility !== visibilityFilter) return false;
//       if (!q) return true;
//       const nameMatch = (tour.name ?? '').toLowerCase().includes(q);
//       const descMatch = (tour.description ?? '').toLowerCase().includes(q);
//       return nameMatch || descMatch;
//     });

//     const sorted = [...filtered];
//     if (sortKey === 'name') {
//       sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
//     } else {
//       sorted.sort((a, b) => {
//         const aTime = new Date(a.updated_at ?? a.created_at ?? '2000-01-01').getTime();
//         const bTime = new Date(b.updated_at ?? b.created_at ?? '2000-01-01').getTime();
//         return bTime - aTime;
//       });
//     }
//     return sorted;
//   }, [tours, searchQuery, visibilityFilter, sortKey]);

//   return (
//     <AppShell>
//       <div className="max-w-3xl mx-auto px-2 py-4 pb-24">
//         <div className="flex gap-2 mb-6">
//           <button
//             className={`px-4 py-2 rounded-full font-semibold transition-all ${tab === 'mine' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`}
//             onClick={() => setTab('mine')}
//           >
//             Lộ trình của tôi
//           </button>
//           <button
//             className={`px-4 py-2 rounded-full font-semibold transition-all ${tab === 'saved' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`}
//             onClick={() => setTab('saved')}
//           >
//             Tour đã lưu
//           </button>
//         </div>
//         {tab === 'mine' && (
//           <div className="bg-white rounded-xl shadow p-4 mb-6">
//             <div className="font-bold text-lg mb-1">✨ Tạo tour mới</div>
//             <div className="text-gray-500 mb-3 text-sm">Xây dựng hành trình khám phá ẩm thực của riêng bạn</div>
//             <div className="grid gap-2">
//               <input
//                 className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 placeholder="Tên tour (ví dụ: Hành trình phở Hà Nội)"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <textarea
//                 className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 placeholder="Mô tả (tùy chọn)"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//               <select
//                 className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 value={visibility}
//                 onChange={(e) => setVisibility(e.target.value as TourVisibility)}
//               >
//                 <option value="PRIVATE">🔒 Riêng tư - Chỉ mình tôi</option>
//                 <option value="PUBLIC">🌍 Công khai - Mọi người đều thấy</option>
//                 <option value="UNLISTED">🔗 Không công khai - Ai có link mới xem được</option>
//               </select>
//               <button
//                 className="bg-orange-500 text-white rounded px-4 py-2 font-semibold hover:bg-orange-600 transition disabled:opacity-60"
//                 onClick={handleCreate}
//                 disabled={isSaving}
//               >
//                 {isSaving ? '⏳ Đang tạo...' : '🚀 Tạo tour ngay'}
//               </button>
//             </div>
//           </div>
//         )}
//         <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
//           <div className="flex-1 flex items-center gap-2">
//             <span className="text-gray-400">🔎</span>
//             <input
//               className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
//               placeholder="Tìm tour theo tên hoặc mô tả..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <select
//             className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             value={visibilityFilter}
//             onChange={(e) => setVisibilityFilter(e.target.value as 'all' | TourVisibility)}
//           >
//             <option value="all">Tất cả trạng thái</option>
//             <option value="PRIVATE">Riêng tư</option>
//             <option value="PUBLIC">Công khai</option>
//             <option value="UNLISTED">Không công khai</option>
//           </select>
//           <select
//             className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             value={sortKey}
//             onChange={(e) => setSortKey(e.target.value as 'updated' | 'name')}
//           >
//             <option value="updated">🕐 Mới cập nhật</option>
//             <option value="name">📝 Theo tên</option>
//           </select>
//           <span className="text-gray-500 text-sm">{filteredTours.length} tour</span>
//         </div>
//         {isLoading && (
//           <div className="flex justify-center items-center py-10 text-gray-400">⏳ Đang tải danh sách tour...</div>
//         )}
//         {!isLoading && filteredTours.length === 0 && (
//           <div className="flex flex-col items-center py-10 text-gray-400">
//             <div className="text-4xl mb-2">🗺️</div>
//             <div>{emptyState}</div>
//           </div>
//         )}
//         {!isLoading && filteredTours.length > 0 && (
//           <div className="grid gap-4 md:grid-cols-2">
//             {filteredTours.map((tour) => {
//               const link = shareLink(tour);
//               const isPreviewOpen = previewId === tour.id;
//               const poiCount = (tour as any).poi_count ?? (tour as any).TourPois?.length ?? 0;
//               return (
//                 <div key={tour.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
//                   <div className="flex items-center justify-between">
//                     <div className="font-bold text-lg truncate max-w-[70%]">{tour.name ?? 'Tour không tên'}</div>
//                     {tour.visibility && (
//                       <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500">
//                         {tour.visibility === 'PRIVATE' && '🔒 Riêng tư'}
//                         {tour.visibility === 'PUBLIC' && '🌍 Công khai'}
//                         {tour.visibility === 'UNLISTED' && '🔗 Không công khai'}
//                       </span>
//                     )}
//                   </div>
//                   <div className="text-gray-500 text-sm line-clamp-2 min-h-[32px]">{tour.description ?? 'Chưa có mô tả'}</div>
//                   <div className="flex gap-2 text-xs text-gray-400">
//                     <span>📍 {poiCount} điểm đến</span>
//                     {(tour.updated_at || tour.created_at) && (
//                       <span>
//                         📅 {new Date(tour.updated_at ?? tour.created_at ?? '2000-01-01').toLocaleDateString('vi-VN')}
//                       </span>
//                     )}
//                   </div>
//                   {link && isPreviewOpen && (
//                     <div className="flex flex-col items-center gap-2 bg-gray-50 rounded p-2">
//                       <div className="text-xs break-all text-orange-500">{link}</div>
//                       <div><QRCode value={link} size={120} /></div>
//                     </div>
//                   )}
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {tab === 'mine' ? (
//                       <button
//                         className="bg-orange-500 text-white rounded px-3 py-1 font-semibold hover:bg-orange-600 transition"
//                         onClick={() => nav(`/tourist/tours/${tour.id}`)}
//                       >
//                         📝 Quản lý tour
//                       </button>
//                     ) : (
//                       <button
//                         className="bg-orange-500 text-white rounded px-3 py-1 font-semibold hover:bg-orange-600 transition"
//                         onClick={() => openMapForTour(tour, 'saved', false)}
//                       >
//                         🗺️ Mở bản đồ
//                       </button>
//                     )}
//                     <button
//                       className="bg-gray-100 text-orange-500 rounded px-3 py-1 font-semibold hover:bg-orange-100 transition"
//                       onClick={() => openMapForTour(tour, tab === 'mine' ? 'mine' : 'saved', true)}
//                     >
//                       🧭 Chỉ đường
//                     </button>
//                     {link && (
//                       <button
//                         className="bg-gray-100 text-orange-500 rounded px-3 py-1 font-semibold hover:bg-orange-100 transition"
//                         onClick={() => setPreviewId(isPreviewOpen ? null : tour.id)}
//                       >
//                         {isPreviewOpen ? '🔒 Ẩn chia sẻ' : '📤 Chia sẻ'}
//                       </button>
//                     )}
//                     {tab === 'mine' && (
//                       <button
//                         className="bg-red-100 text-red-600 rounded px-3 py-1 font-semibold hover:bg-red-200 transition"
//                         onClick={async () => {
//                           if (window.confirm('Bạn có chắc muốn xóa tour này?')) {
//                             try {
//                               await deleteMyTour(tour.id);
//                               loadTours();
//                               showToast({ title: '🗑️ Đã xóa tour' });
//                             } catch {
//                               showToast({ title: 'Xóa tour thất bại' });
//                             }
//                           }
//                         }}
//                       >
//                         🗑️ Xóa
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </AppShell>
//   );
// }




// src/pages/RoutePage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../shared/ui/AppShell';
import { useAppStore } from '../../shared/store/appStore';
import {
  createMyTour,
  // deleteMyTour,
  getMyTours,
  type TourVisibility,
  type UserTour,
} from '../../api/services/userTours';
import { getSavedTours } from '../../api/services/userSavedTours';
// import { Plus, Map, Bookmark, Trash2, Share2, Eye } from 'lucide-react';

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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-6 py-2.5 font-medium rounded-full transition-all ${
              activeTab === 'mine' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Lộ trình của tôi
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-2.5 font-medium rounded-full transition-all ${
              activeTab === 'saved' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tour đã lưu
          </button>
        </div>

        {/* Tạo tour mới - chỉ hiển thị khi ở tab "mine" */}
        {activeTab === 'mine' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-orange-100 rounded-2xl flex items-center justify-center">
                ✨
              </div>
              <div>
                <h2 className="font-semibold text-xl">Tạo tour mới</h2>
                <p className="text-sm text-gray-500">Xây dựng hành trình khám phá ẩm thực của riêng bạn</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên tour (ví dụ: Hành trình phở Hà Nội)"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Mô tả (tùy chọn)"
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as TourVisibility)}
              >
                <option value="PRIVATE">🔒 Riêng tư - Chỉ mình tôi</option>
                <option value="PUBLIC">🌍 Công khai</option>
                <option value="UNLISTED">🔗 Không công khai (có link)</option>
              </select>

              <button
                onClick={handleCreateTour}
                disabled={isCreating || !name.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
              >
                {isCreating ? 'Đang tạo...' : '🚀 Tạo tour ngay'}
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
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-4 top-3.5 text-gray-400">🔎</span>
          </div>
          <span className="text-sm text-gray-500 self-center whitespace-nowrap">
            {filteredTours.length} tour
          </span>
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}

        {/* Tour List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg line-clamp-1">{tour.name || 'Tour không tên'}</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  tour.visibility === 'PUBLIC' ? 'bg-green-100 text-green-700' : 
                  tour.visibility === 'PRIVATE' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {tour.visibility === 'PUBLIC' ? 'Công khai' : 
                   tour.visibility === 'PRIVATE' ? 'Riêng tư' : 'Không công khai'}
                </span>
              </div>

              <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[44px]">
                {tour.description || 'Chưa có mô tả'}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
                <span>📍 {tour.poi_count || 0} điểm đến</span>
                <span>📅 {new Date(tour.updated_at || tour.created_at || '2000-01-01').toLocaleDateString('vi-VN')}</span>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => nav(`/tourist/tours/${tour.id}`)}
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-2xl font-medium hover:bg-orange-600 transition"
                >
                  Quản lý tour
                </button>
                <button
                  onClick={() => nav(`/tourist/map?tourId=${tour.id}`)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-2xl font-medium hover:bg-gray-50 transition"
                >
                  Xem bản đồ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}