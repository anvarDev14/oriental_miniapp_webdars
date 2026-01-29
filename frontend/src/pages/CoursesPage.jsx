import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { coursesAPI, directionsAPI } from '../api/api';
import { ListSkeleton } from '../components/LoadingScreen';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { directionId } = useParams();
  const { courses, setCourses, selectedDirection, setSelectedDirection } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [directionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load direction info
      const directionResponse = await directionsAPI.getOne(directionId);
      setSelectedDirection(directionResponse.data.direction);

      // Load courses
      const coursesResponse = await coursesAPI.getByDirection(directionId);
      setCourses(coursesResponse.data.courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'started') return course.progress_percent > 0 && course.progress_percent < 100;
    if (activeFilter === 'completed') return course.progress_percent === 100;
    if (activeFilter === 'new') return course.progress_percent === 0;
    return true;
  });

  const getLevelBadgeClass = (level) => {
    const classes = {
      beginner: 'level-beginner',
      intermediate: 'level-intermediate',
      advanced: 'level-advanced',
    };
    return classes[level] || 'level-beginner';
  };

  const getLevelText = (level) => {
    const texts = {
      beginner: 'Boshlang\'ich',
      intermediate: 'O\'rta',
      advanced: 'Yuqori',
    };
    return texts[level] || 'Boshlang\'ich';
  };

  const formatDuration = (hours) => {
    if (!hours) return '';
    if (hours < 1) return `${Math.round(hours * 60)} daqiqa`;
    return `${hours} soat`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
            {selectedDirection?.icon_url || '📚'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {selectedDirection?.name || 'Kurslar'}
            </h1>
            <p className="text-blue-100 text-sm">
              {courses.length} ta kurs mavjud
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="tab-nav bg-white/10">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'new', label: 'Yangi' },
            { id: 'started', label: 'Davom' },
            { id: 'completed', label: 'Tugagan' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`tab-item ${
                activeFilter === filter.id
                  ? 'bg-white text-blue-600'
                  : 'text-white/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      {!loading && courses.length > 0 && (
        <div className="px-4 py-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm">Umumiy progress</span>
              <span className="text-blue-600 font-semibold">
                {Math.round(
                  courses.reduce((sum, c) => sum + (c.progress_percent || 0), 0) / courses.length
                )}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${
                    courses.reduce((sum, c) => sum + (c.progress_percent || 0), 0) / courses.length
                  }%`
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>
                {courses.filter(c => c.progress_percent === 100).length} tugatilgan
              </span>
              <span>
                {courses.filter(c => c.progress_percent > 0 && c.progress_percent < 100).length} davom etmoqda
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="px-4 pb-6">
        {loading ? (
          <ListSkeleton count={4} />
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">Kurslar topilmadi</div>
            <div className="empty-state-text">
              Bu filtrdagi kurslar hozircha mavjud emas
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course, index) => (
              <button
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                className="card card-hover w-full text-left overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-blue-400 to-blue-600">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white/30">
                      📖
                    </div>
                  )}

                  {/* Progress Overlay */}
                  {course.progress_percent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${course.progress_percent}%` }}
                      />
                    </div>
                  )}

                  {/* Completed Badge */}
                  {course.progress_percent === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      ✓ Tugatildi
                    </div>
                  )}

                  {/* Language Badge */}
                  <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {course.language === 'english' ? '🇬🇧 English' :
                     course.language === 'arabic' ? '🇸🇦 العربية' :
                     course.language === 'uzbek' ? '🇺🇿 O\'zbek' : course.language}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 line-clamp-2">
                      {course.title}
                    </h3>
                    <span className={`level-badge flex-shrink-0 ${getLevelBadgeClass(course.level)}`}>
                      {getLevelText(course.level)}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {course.description || "Bu kursda ko'plab foydali materiallar mavjud"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📖 {course.total_materials || 0} dars
                      </span>
                      {course.duration_hours > 0 && (
                        <span className="flex items-center gap-1">
                          ⏱ {formatDuration(course.duration_hours)}
                        </span>
                      )}
                    </div>

                    {course.progress_percent > 0 && course.progress_percent < 100 && (
                      <span className="text-blue-600 text-sm font-medium">
                        {course.progress_percent}%
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {course.progress_percent > 0 && course.progress_percent < 100 && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  {course.progress_percent > 0 && course.progress_percent < 100 && (
                    <div className="mt-3">
                      <span className="btn btn-primary w-full text-center block text-sm">
                        Davom ettirish
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
