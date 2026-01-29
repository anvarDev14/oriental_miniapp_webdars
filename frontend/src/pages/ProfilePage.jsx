import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { gamificationAPI, authAPI } from '../api/api';
import { ListSkeleton } from '../components/LoadingScreen';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useStore();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [achievementsRes, userRes] = await Promise.all([
        gamificationAPI.getAchievements(),
        authAPI.me()
      ]);
      setAchievements(achievementsRes.data.achievements || []);
      if (userRes.data.user) {
        updateUser(userRes.data.user);
        setStats(userRes.data.user);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    const currentXP = user?.xp_points || 0;
    const currentLevel = user?.level || 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getAchievementIcon = (type) => {
    const icons = {
      first_lesson: '🎯',
      streak_3: '🔥',
      streak_7: '💪',
      streak_30: '🏆',
      complete_course: '📚',
      xp_100: '⭐',
      xp_500: '🌟',
      xp_1000: '💫',
    };
    return icons[type] || '🏅';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="gradient-primary px-4 pt-8 pb-12 text-center relative">
        <div className="absolute top-4 right-4">
          {user?.is_admin && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              Admin Panel
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="avatar avatar-lg mx-auto mb-4 shadow-xl">
          {user?.full_name?.charAt(0) || 'U'}
        </div>

        <h1 className="text-xl font-bold text-white mb-1">
          {user?.full_name || 'Foydalanuvchi'}
        </h1>
        <p className="text-blue-100 text-sm mb-1">
          @{user?.username || 'username'}
        </p>

        {/* Level Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mt-2">
          <span className="text-white font-bold">Level {user?.level || 1}</span>
          <span className="text-yellow-300">⭐</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stats-card animate-fade-in-up">
            <div className="stats-value text-blue-600">
              {user?.xp_points || 0}
            </div>
            <div className="stats-label">XP ball</div>
          </div>
          <div className="stats-card animate-fade-in-up">
            <div className="stats-value text-emerald-600">
              {stats?.completed_materials || 0}
            </div>
            <div className="stats-label">Tugatilgan</div>
          </div>
          <div className="stats-card animate-fade-in-up">
            <div className="stats-value text-orange-500">
              {user?.streak_days || 0}
              <span className="text-base ml-1">🔥</span>
            </div>
            <div className="stats-label">Kun streak</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Level progress</span>
            <span className="text-blue-600 font-bold">
              Level {user?.level || 1} → {(user?.level || 1) + 1}
            </span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{user?.xp_points || 0} XP</span>
            <span>{(user?.level || 1) * 100} XP</span>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Yutuqlar ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </h2>

          {achievements.length === 0 ? (
            <div className="card p-6 text-center">
              <span className="text-4xl block mb-3">🏅</span>
              <p className="text-gray-500">Hozircha yutuqlar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.id || index}
                  className={`card p-3 text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                      : 'opacity-50 grayscale'
                  }`}
                >
                  <span className="text-3xl block mb-2">
                    {getAchievementIcon(achievement.type)}
                  </span>
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">
                    {achievement.name}
                  </p>
                  {achievement.unlocked && (
                    <span className="text-xs text-yellow-600 mt-1 block">
                      +{achievement.xp_reward || 0} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Details */}
        <div className="card mb-6 overflow-hidden">
          <h3 className="font-bold text-gray-800 p-4 bg-gray-50 border-b">
            Batafsil statistika
          </h3>
          <div className="divide-y">
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-600">Jami darslar</span>
              <span className="font-semibold">{stats?.total_materials || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-600">Tugatilgan darslar</span>
              <span className="font-semibold text-emerald-600">
                {stats?.completed_materials || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-600">Sarflangan vaqt</span>
              <span className="font-semibold">
                {stats?.total_time ? `${Math.round(stats.total_time / 60)} daqiqa` : '0 daqiqa'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-600">Eng uzun streak</span>
              <span className="font-semibold text-orange-500">
                {stats?.max_streak || user?.streak_days || 0} kun 🔥
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-600">Ro'yxatdan o'tgan</span>
              <span className="font-semibold text-gray-500">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/leaderboard')}
            className="card card-hover p-4 text-center"
          >
            <span className="text-2xl block mb-2">🏆</span>
            <span className="text-sm font-medium text-gray-700">Reyting</span>
          </button>
          <button
            onClick={() => navigate('/favorites')}
            className="card card-hover p-4 text-center"
          >
            <span className="text-2xl block mb-2">⭐</span>
            <span className="text-sm font-medium text-gray-700">Saralangan</span>
          </button>
        </div>

        {/* Motivational Card */}
        <div className="card p-4 mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💪</span>
            <div>
              <h3 className="font-bold mb-1">Ajoyib natija!</h3>
              <p className="text-purple-100 text-sm">
                O'rganishda davom eting va yangi cho'qqilarni zabt eting!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
