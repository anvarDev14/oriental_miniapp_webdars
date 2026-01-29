import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { gamificationAPI } from '../api/api';
import { ListSkeleton } from '../components/LoadingScreen';

export default function LeaderboardPage() {
  const { user } = useStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month

  useEffect(() => {
    loadLeaderboard();
  }, [timeRange]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await gamificationAPI.getLeaderboard(50);
      setLeaderboard(response.data.leaderboard || []);
      setUserPosition(response.data.user_position);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { class: 'rank-1', icon: '🥇' };
    if (rank === 2) return { class: 'rank-2', icon: '🥈' };
    if (rank === 3) return { class: 'rank-3', icon: '🥉' };
    return { class: 'bg-gray-200 text-gray-600', icon: rank };
  };

  const isCurrentUser = (item) => {
    return item.telegram_id === user?.telegram_id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-8">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">🏆</span>
          <h1 className="text-2xl font-bold text-white">Reyting</h1>
          <p className="text-blue-100 text-sm">Eng faol o'quvchilar</p>
        </div>

        {/* Time Range Tabs */}
        <div className="tab-nav bg-white/10">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'month', label: 'Oylik' },
            { id: 'week', label: 'Haftalik' },
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`tab-item ${
                timeRange === range.id
                  ? 'bg-white text-blue-600'
                  : 'text-white/80'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* User's Position Card */}
      {userPosition && !loading && (
        <div className="px-4 -mt-4 mb-4">
          <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="rank-badge rank-1">
                #{userPosition}
              </div>
              <div className="flex-1">
                <p className="text-gray-700 font-medium">Sizning o'rningiz</p>
                <p className="text-gray-500 text-sm">
                  {user?.xp_points || 0} XP bilan
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">
                  Level {user?.level || 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="px-4 mb-6">
          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            <div className="text-center flex-1">
              <div className="avatar mx-auto mb-2 bg-gradient-to-br from-gray-300 to-gray-400">
                {leaderboard[1]?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="card p-3 bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-2xl">🥈</span>
                <p className="font-semibold text-gray-700 text-sm line-clamp-1 mt-1">
                  {leaderboard[1]?.full_name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-blue-600 font-bold text-sm">
                  {leaderboard[1]?.xp_points || 0} XP
                </p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center flex-1">
              <div className="avatar avatar-lg mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-amber-500 animate-bounce-soft">
                {leaderboard[0]?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="card p-4 bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300">
                <span className="text-3xl">🥇</span>
                <p className="font-bold text-gray-800 text-sm line-clamp-1 mt-1">
                  {leaderboard[0]?.full_name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-blue-600 font-bold">
                  {leaderboard[0]?.xp_points || 0} XP
                </p>
                <span className="text-xs text-yellow-600">
                  Level {leaderboard[0]?.level || 1}
                </span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center flex-1">
              <div className="avatar mx-auto mb-2 bg-gradient-to-br from-amber-600 to-amber-700">
                {leaderboard[2]?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="card p-3 bg-gradient-to-br from-amber-50 to-orange-100">
                <span className="text-2xl">🥉</span>
                <p className="font-semibold text-gray-700 text-sm line-clamp-1 mt-1">
                  {leaderboard[2]?.full_name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-blue-600 font-bold text-sm">
                  {leaderboard[2]?.xp_points || 0} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="px-4 pb-6">
        {loading ? (
          <ListSkeleton count={10} />
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <div className="empty-state-title">Hozircha reyting bo'sh</div>
            <div className="empty-state-text">
              Birinchi bo'lib reytingga kiring!
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(3).map((item, index) => {
              const rank = index + 4;
              const rankInfo = getRankBadge(rank);
              const isCurrent = isCurrentUser(item);

              return (
                <div
                  key={item.telegram_id || index}
                  className={`card p-4 flex items-center gap-4 animate-fade-in-up ${
                    isCurrent ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Rank */}
                  <div className={`rank-badge ${rankInfo.class}`}>
                    {rankInfo.icon}
                  </div>

                  {/* Avatar */}
                  <div className={`avatar ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}`}>
                    {item.full_name?.charAt(0) || 'U'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold line-clamp-1 ${
                      isCurrent ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {item.full_name || 'Foydalanuvchi'}
                      {isCurrent && <span className="text-xs ml-2">(Siz)</span>}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Level {item.level || 1}</span>
                      <span className="flex items-center gap-1">
                        🔥 {item.streak_days || 0} kun
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <span className="font-bold text-blue-600">
                      {item.xp_points || 0}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Motivation Card */}
      <div className="px-4 pb-6">
        <div className="card p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h3 className="font-bold mb-1">Reyting ko'tarish</h3>
              <p className="text-purple-100 text-sm">
                Ko'proq darslarni tugatib, XP to'plang va reytingda ko'tariling!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
