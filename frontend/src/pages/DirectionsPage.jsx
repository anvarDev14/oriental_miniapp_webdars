import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { directionsAPI } from '../api/api';
import { ListSkeleton } from '../components/LoadingScreen';

export default function DirectionsPage() {
  const navigate = useNavigate();
  const { directions, setDirections } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDirections();
  }, []);

  const loadDirections = async () => {
    try {
      setLoading(true);
      const response = await directionsAPI.getAll();
      setDirections(response.data.directions);
    } catch (error) {
      console.error('Error loading directions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDirections = directions.filter(direction =>
    direction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    direction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirectionIcon = (index) => {
    const icons = ['📚', '🌍', '💼', '🎨', '🔬', '📊', '🎵', '🏃'];
    return icons[index % icons.length];
  };

  const getDirectionGradient = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-cyan-500 to-cyan-600',
      'from-indigo-500 to-indigo-600',
      'from-amber-500 to-amber-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Yo'nalishlar</h1>
        <p className="text-gray-500 text-sm mb-4">O'zingizga mos yo'nalishni tanlang</p>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white min-w-[140px]">
            <div className="text-2xl font-bold">{directions.length}</div>
            <div className="text-blue-100 text-sm">Jami yo'nalishlar</div>
          </div>
          <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white min-w-[140px]">
            <div className="text-2xl font-bold">
              {directions.filter(d => d.progress_percent > 0).length}
            </div>
            <div className="text-emerald-100 text-sm">Boshlangan</div>
          </div>
          <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white min-w-[140px]">
            <div className="text-2xl font-bold">
              {directions.filter(d => d.progress_percent === 100).length}
            </div>
            <div className="text-purple-100 text-sm">Tugatilgan</div>
          </div>
        </div>
      </div>

      {/* Directions List */}
      <div className="px-4 pb-6">
        {loading ? (
          <ListSkeleton count={4} />
        ) : filteredDirections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Topilmadi</div>
            <div className="empty-state-text">
              "{searchQuery}" bo'yicha yo'nalish topilmadi
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDirections.map((direction, index) => (
              <button
                key={direction.id}
                onClick={() => navigate(`/courses/${direction.id}`)}
                className="card card-hover w-full overflow-hidden animate-fade-in-up stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${getDirectionGradient(index)}`} />

                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getDirectionGradient(index)} flex items-center justify-center text-3xl text-white shadow-lg`}>
                      {direction.icon_url || getDirectionIcon(index)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">
                        {direction.name}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {direction.description || "Bu yo'nalishda ko'plab foydali kurslar mavjud"}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          📖 {direction.total_materials || 0} dars
                        </span>
                        {direction.completed_materials > 0 && (
                          <span className="text-emerald-600">
                            ✓ {direction.completed_materials} tugatildi
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {direction.progress_percent > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs font-medium text-blue-600">
                              {Math.round(direction.progress_percent)}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${direction.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400 mt-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
