import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { directionsAPI, gamificationAPI } from '../api/api';
import { StatsSkeleton, ListSkeleton } from '../components/LoadingScreen';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, directions, setDirections } = useStore();
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  const getLevelProgress = () => {
    const currentXP = user?.xp_points || 0;
    const currentLevel = user?.level || 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header Section */}
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="avatar">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-blue-100 text-sm">{getGreeting()}</p>
              <h1 className="text-white font-bold text-lg">
                {user?.full_name || 'Foydalanuvchi'}
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/leaderboard')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            🏆
          </button>
        </div>

        {/* Level Progress */}
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/90 text-sm">Level {user?.level || 1}</span>
            <span className="text-white/90 text-sm">{user?.xp_points || 0} XP</span>
          </div>
          <div className="progress-bar bg-white/20">
            <div
              className="progress-bar-fill bg-white"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <p className="text-white/70 text-xs mt-2 text-center">
            Keyingi levelgacha {100 - (user?.xp_points % 100 || 0)} XP qoldi
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Stats Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="stats-card animate-fade-in-up stagger-item">
              <div className="stats-value text-blue-600">
                {user?.xp_points || 0}
              </div>
              <div className="stats-label">XP ball</div>
            </div>
            <div className="stats-card animate-fade-in-up stagger-item">
              <div className="stats-value text-emerald-600">
                {user?.level || 1}
              </div>
              <div className="stats-label">Daraja</div>
            </div>
            <div className="stats-card animate-fade-in-up stagger-item">
              <div className="stats-value text-orange-500">
                {user?.streak_days || 0}
                <span className="text-lg ml-1">🔥</span>
              </div>
              <div className="stats-label">Kun streak</div>
            </div>
          </div>
        )}

        {/* Daily Challenge */}
        <div className="card p-4 mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl animate-bounce-soft">🎯</span>
            <div>
              <h3 className="font-bold">Kunlik vazifa</h3>
              <p className="text-white/80 text-sm">Bugun 3 ta dars tugatish</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="progress-bar bg-white/20 flex-1 mr-4">
              <div className="progress-bar-fill bg-white" style={{ width: '33%' }} />
            </div>
            <span className="text-sm font-medium">1/3</span>
          </div>
        </div>

        {/* Directions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Yo'nalishlar</h2>
            <button
              onClick={() => navigate('/directions')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Barchasi →
            </button>
          </div>

          {loading ? (
            <ListSkeleton count={2} />
          ) : (
            <div className="space-y-3">
              {directions.slice(0, 3).map((direction, index) => (
                <button
                  key={direction.id}
                  onClick={() => navigate(`/courses/${direction.id}`)}
                  className="card card-hover w-full p-4 text-left animate-fade-in-up stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl">
                      {direction.icon_url || '📖'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{direction.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{direction.description}</p>
                      {direction.progress_percent > 0 && (
                        <div className="mt-2">
                          <div className="progress-bar h-1.5">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${direction.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {Math.round(direction.progress_percent)}% tugatildi
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tezkor amallar</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/favorites')}
              className="card card-hover p-4 text-center animate-fade-in-up"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl mb-2">
                ⭐
              </div>
              <span className="text-sm font-semibold text-gray-700">Saralangan</span>
              <p className="text-xs text-gray-500 mt-1">Sevimli darslar</p>
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="card card-hover p-4 text-center animate-fade-in-up"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-2">
                🏆
              </div>
              <span className="text-sm font-semibold text-gray-700">Reyting</span>
              <p className="text-xs text-gray-500 mt-1">Top o'quvchilar</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="card card-hover p-4 text-center animate-fade-in-up"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-2">
                📊
              </div>
              <span className="text-sm font-semibold text-gray-700">Statistika</span>
              <p className="text-xs text-gray-500 mt-1">Natijalarim</p>
            </button>
            <button
              onClick={() => navigate('/directions')}
              className="card card-hover p-4 text-center animate-fade-in-up"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-2">
                📚
              </div>
              <span className="text-sm font-semibold text-gray-700">Barcha kurslar</span>
              <p className="text-xs text-gray-500 mt-1">O'rganishni boshlash</p>
            </button>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="card p-4 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-gray-700 italic text-sm">
                "Bilim olish - eng katta boylik. Har kuni yangi narsa o'rganing!"
              </p>
              <p className="text-gray-500 text-xs mt-2">— Oriental Academy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
