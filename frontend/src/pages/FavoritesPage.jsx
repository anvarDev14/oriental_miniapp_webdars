import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { favoritesAPI } from '../api/api';
import { ListSkeleton } from '../components/LoadingScreen';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, setFavorites, removeFavorite } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getAll();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (materialId, e) => {
    e.stopPropagation();
    try {
      await favoritesAPI.remove(materialId);
      removeFavorite(materialId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getMaterialIcon = (type) => {
    const icons = {
      video: '🎬',
      audio: '🎧',
      pdf: '📄',
      text: '📝',
      quiz: '❓',
    };
    return icons[type] || '📖';
  };

  const getMaterialTypeText = (type) => {
    const texts = {
      video: 'Video',
      audio: 'Audio',
      pdf: 'PDF',
      text: 'Matn',
      quiz: 'Test',
    };
    return texts[type] || 'Material';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⭐</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Saralangan</h1>
            <p className="text-gray-500 text-sm">
              {favorites.length} ta material saqlangan
            </p>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="p-4">
        {loading ? (
          <ListSkeleton count={4} />
        ) : favorites.length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-state-icon">⭐</div>
            <div className="empty-state-title">Saralangan materiallar yo'q</div>
            <div className="empty-state-text mb-6">
              Sevimli darslaringizni yulduzcha bosib saqlang
            </div>
            <button
              onClick={() => navigate('/directions')}
              className="btn btn-primary"
            >
              Kurslarni ko'rish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((material, index) => (
              <div
                key={material.id}
                className="card card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => navigate(`/material/${material.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
                      {getMaterialIcon(material.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                        {material.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="capitalize">{getMaterialTypeText(material.type)}</span>
                        {material.course_title && (
                          <span className="line-clamp-1">📚 {material.course_title}</span>
                        )}
                      </div>

                      {/* Progress */}
                      {material.progress?.progress_percent > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="progress-bar h-1.5 flex-1">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${material.progress.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(material.progress.progress_percent)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Completed Badge */}
                    {material.progress?.completed && (
                      <div className="flex-shrink-0">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                  <button
                    onClick={() => navigate(`/material/${material.id}`)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    {material.progress?.completed ? 'Qayta ko\'rish' :
                     material.progress?.progress_percent > 0 ? 'Davom ettirish' : 'Boshlash'}
                  </button>
                  <button
                    onClick={(e) => handleRemoveFavorite(material.id, e)}
                    className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
                  >
                    <span>★</span>
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Card */}
      {favorites.length > 0 && (
        <div className="px-4 pb-6">
          <div className="card p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Maslahat</h3>
                <p className="text-gray-600 text-sm">
                  Saralangan darslaringizni muntazam takrorlang - bu bilimlarni mustahkamlashga yordam beradi!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
