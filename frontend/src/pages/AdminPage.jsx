import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { adminAPI, directionsAPI, coursesAPI, materialsAPI } from '../api/api';
import { ListSkeleton, StatsSkeleton } from '../components/LoadingScreen';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [directions, setDirections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, directionsRes] = await Promise.all([
        adminAPI.getStats(),
        directionsAPI.getAll()
      ]);
      setStats(statsRes.data.stats);
      setDirections(directionsRes.data.directions || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDirection = async () => {
    try {
      await directionsAPI.create(formData);
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error creating direction:', error);
    }
  };

  const handleDeleteDirection = async (id) => {
    if (!confirm('Bu yo\'nalishni o\'chirmoqchimisiz?')) return;
    try {
      await directionsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting direction:', error);
    }
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Ruxsat yo'q</h1>
          <p className="text-gray-500 mb-4">Bu sahifa faqat adminlar uchun</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Bosh sahifaga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-100 text-sm">Boshqaruv paneli</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30"
          >
            Profilga
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 bg-white shadow-sm">
        <div className="tab-nav">
          {[
            { id: 'stats', label: 'Statistika', icon: '📊' },
            { id: 'directions', label: "Yo'nalishlar", icon: '📚' },
            { id: 'users', label: 'Foydalanuvchilar', icon: '👥' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item flex items-center justify-center gap-1 ${
                activeTab === tab.id ? 'tab-item-active' : ''
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <>
            <StatsSkeleton />
            <div className="mt-4">
              <ListSkeleton count={3} />
            </div>
          </>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="stats-card bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="stats-value text-blue-600">
                      {stats?.total_users || 0}
                    </div>
                    <div className="stats-label">Foydalanuvchilar</div>
                  </div>
                  <div className="stats-card bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <div className="stats-value text-emerald-600">
                      {stats?.total_directions || 0}
                    </div>
                    <div className="stats-label">Yo'nalishlar</div>
                  </div>
                  <div className="stats-card bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="stats-value text-purple-600">
                      {stats?.total_courses || 0}
                    </div>
                    <div className="stats-label">Kurslar</div>
                  </div>
                  <div className="stats-card bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="stats-value text-orange-600">
                      {stats?.total_materials || 0}
                    </div>
                    <div className="stats-label">Materiallar</div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="card p-4">
                  <h3 className="font-bold text-gray-800 mb-4">Faollik</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Bugungi faol foydalanuvchilar</span>
                      <span className="font-semibold text-blue-600">
                        {stats?.active_today || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Jami tugatilgan darslar</span>
                      <span className="font-semibold text-emerald-600">
                        {stats?.completed_materials || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">O'rtacha XP</span>
                      <span className="font-semibold text-purple-600">
                        {stats?.avg_xp || 0} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-4">
                  <h3 className="font-bold text-gray-800 mb-4">Tezkor amallar</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openCreateModal('direction')}
                      className="btn btn-primary text-sm"
                    >
                      + Yo'nalish qo'shish
                    </button>
                    <button
                      onClick={() => setActiveTab('directions')}
                      className="btn btn-secondary text-sm"
                    >
                      Yo'nalishlarni ko'rish
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Directions Tab */}
            {activeTab === 'directions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    Yo'nalishlar ({directions.length})
                  </h2>
                  <button
                    onClick={() => openCreateModal('direction')}
                    className="btn btn-primary text-sm py-2"
                  >
                    + Qo'shish
                  </button>
                </div>

                {directions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <div className="empty-state-title">Yo'nalishlar yo'q</div>
                    <div className="empty-state-text">
                      Yangi yo'nalish qo'shing
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {directions.map((direction, index) => (
                      <div
                        key={direction.id}
                        className="card p-4 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl text-white">
                            {direction.icon_url || '📖'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800">
                              {direction.name}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-1">
                              {direction.description || 'Tavsif yo\'q'}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span>{direction.total_materials || 0} material</span>
                              <span className={direction.is_active ? 'text-emerald-500' : 'text-red-500'}>
                                {direction.is_active ? '● Faol' : '○ Nofaol'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/courses/${direction.id}`)}
                              className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                            >
                              👁
                            </button>
                            <button
                              onClick={() => handleDeleteDirection(direction.id)}
                              className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Foydalanuvchilar</h2>

                <div className="card p-6 text-center">
                  <span className="text-4xl block mb-4">👥</span>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Jami: {stats?.total_users || 0} foydalanuvchi
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Batafsil ma'lumot uchun reyting sahifasiga o'ting
                  </p>
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="btn btn-primary mt-4"
                  >
                    Reytingni ko'rish
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {modalType === 'direction' ? "Yangi yo'nalish" : 'Yangi kurs'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Masalan: Ingliz tili"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="Yo'nalish haqida qisqa ma'lumot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon_url || ''}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="input"
                  placeholder="📚"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary flex-1"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateDirection}
                disabled={!formData.name}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
