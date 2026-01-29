import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { materialsAPI, favoritesAPI } from '../api/api';
import { CardSkeleton } from '../components/LoadingScreen';

export default function MaterialPage() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const { currentMaterial, setCurrentMaterial, favorites, addFavorite, removeFavorite } = useStore();
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadMaterial();
  }, [materialId]);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      const response = await materialsAPI.getOne(materialId);
      setCurrentMaterial(response.data.material);
      setProgress(response.data.material.progress?.progress_percent || 0);
      setIsCompleted(response.data.material.progress?.completed || false);

      // Check if favorited
      const favResponse = await favoritesAPI.getAll();
      setIsFavorite(favResponse.data.favorites.some(f => f.id === parseInt(materialId)));
    } catch (error) {
      console.error('Error loading material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(materialId);
        removeFavorite(parseInt(materialId));
        setIsFavorite(false);
      } else {
        await favoritesAPI.add(materialId);
        addFavorite(currentMaterial);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleProgressUpdate = async (newProgress, completed = false) => {
    try {
      const result = await materialsAPI.updateProgress(materialId, {
        progress_percent: Math.round(newProgress),
        completed: completed,
        last_position: Math.round(newProgress),
        time_spent: 0,
      });

      setProgress(newProgress);
      if (completed) setIsCompleted(true);

      // Check for new achievements
      if (result.data.new_achievements?.length > 0) {
        // Could show achievement notification here
        console.log('New achievements:', result.data.new_achievements);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoProgress = (e) => {
    const video = e.target;
    const newProgress = (video.currentTime / video.duration) * 100;
    if (newProgress - progress > 5) {
      handleProgressUpdate(newProgress, newProgress >= 95);
    }
  };

  const handleAudioProgress = (e) => {
    const audio = e.target;
    const newProgress = (audio.currentTime / audio.duration) * 100;
    if (newProgress - progress > 5) {
      handleProgressUpdate(newProgress, newProgress >= 95);
    }
  };

  const handleMarkComplete = () => {
    handleProgressUpdate(100, true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <CardSkeleton />
      </div>
    );
  }

  const material = currentMaterial;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getMaterialIcon(material?.type)}</span>
            <div>
              <h1 className="font-bold text-gray-800 line-clamp-1">
                {material?.title}
              </h1>
              <span className="text-xs text-gray-500 capitalize">
                {material?.type}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isFavorite ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="progress-bar flex-1">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Media Content */}
      <div className="p-4">
        {/* Video Player */}
        {material?.type === 'video' && (
          <div className="video-container mb-4">
            {material.file_url ? (
              <video
                ref={videoRef}
                src={material.file_url}
                controls
                className="w-full h-full"
                onTimeUpdate={handleVideoProgress}
                onEnded={() => handleProgressUpdate(100, true)}
              >
                Brauzeringiz video formatini qo'llab-quvvatlamaydi
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <div className="text-center">
                  <span className="text-6xl block mb-4">🎬</span>
                  <p>Video fayli mavjud emas</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio Player */}
        {material?.type === 'audio' && (
          <div className="audio-container mb-4">
            <div className="text-center text-white">
              <span className="text-6xl block mb-4 animate-pulse-slow">🎧</span>
              <h3 className="font-bold mb-4">{material.title}</h3>
              {material.file_url ? (
                <audio
                  ref={audioRef}
                  src={material.file_url}
                  controls
                  className="w-full"
                  onTimeUpdate={handleAudioProgress}
                  onEnded={() => handleProgressUpdate(100, true)}
                />
              ) : (
                <p className="text-white/70">Audio fayli mavjud emas</p>
              )}
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {material?.type === 'pdf' && (
          <div className="pdf-container mb-4">
            {material.file_url ? (
              <iframe
                src={`${material.file_url}#toolbar=0`}
                className="w-full h-96"
                title={material.title}
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <span className="text-6xl block mb-4">📄</span>
                  <p>PDF fayli mavjud emas</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        {material?.type === 'text' && (
          <div className="card p-4 mb-4">
            <div className="prose prose-sm max-w-none">
              {material.description || material.content || (
                <p className="text-gray-500 text-center py-8">
                  Matn mavjud emas
                </p>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {material?.description && material?.type !== 'text' && (
          <div className="card p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-2">Tavsif</h3>
            <p className="text-gray-600 text-sm">{material.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              className="btn btn-success w-full flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>Tugatildi deb belgilash</span>
            </button>
          )}

          {isCompleted && (
            <div className="card p-4 bg-emerald-50 border-emerald-200 text-center">
              <span className="text-3xl block mb-2">🎉</span>
              <h3 className="font-bold text-emerald-700">Tabriklaymiz!</h3>
              <p className="text-emerald-600 text-sm">Bu darsni muvaffaqiyatli tugatdingiz</p>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary w-full"
          >
            Ortga qaytish
          </button>
        </div>

        {/* XP Info */}
        <div className="card p-4 mt-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm text-gray-600">
                Har bir tugatilgan dars uchun <strong className="text-blue-600">+10 XP</strong> olasiz!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
