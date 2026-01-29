import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { coursesAPI } from '../api/api';
import { ListSkeleton } from '../components/LoadingScreen';

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { selectedCourse, setSelectedCourse } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getOne(courseId);
      setSelectedCourse(response.data.course);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
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

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} daqiqa`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} soat ${remainingMinutes} daqiqa`;
  };

  const getNextMaterial = () => {
    if (!selectedCourse?.materials) return null;
    return selectedCourse.materials.find(
      m => !m.progress?.completed && m.progress?.progress_percent < 100
    ) || selectedCourse.materials[0];
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ListSkeleton count={5} />
      </div>
    );
  }

  const course = selectedCourse;
  const nextMaterial = getNextMaterial();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
          {course?.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover opacity-30"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-white/20">
              📚
            </div>
          )}
        </div>

        {/* Course Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <span className={`level-badge ${getLevelBadgeClass(course?.level)}`}>
              {getLevelText(course?.level)}
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">
              {course?.language === 'english' ? '🇬🇧 English' :
               course?.language === 'arabic' ? '🇸🇦 العربية' :
               '🇺🇿 O\'zbek'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">
            {course?.title}
          </h1>
          <p className="text-white/80 text-sm line-clamp-2">
            {course?.description}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-4 py-4 -mt-2">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-gray-600 text-sm">Sizning progressingiz</span>
              <div className="text-2xl font-bold text-blue-600">
                {course?.completed_materials || 0} / {course?.total_materials || 0}
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - (course?.completed_materials || 0) / (course?.total_materials || 1))}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                {Math.round((course?.completed_materials || 0) / (course?.total_materials || 1) * 100)}%
              </span>
            </div>
          </div>

          {/* Continue Button */}
          {nextMaterial && (
            <button
              onClick={() => navigate(`/material/${nextMaterial.id}`)}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>{course?.completed_materials > 0 ? 'Davom ettirish' : 'Boshlash'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Materials List */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Darslar ({course?.materials?.length || 0})
        </h2>

        <div className="space-y-3">
          {course?.materials?.map((material, index) => {
            const isCompleted = material.progress?.completed;
            const isInProgress = material.progress?.progress_percent > 0 && !isCompleted;
            const isLocked = false; // Can implement locked logic if needed

            return (
              <button
                key={material.id}
                onClick={() => navigate(`/material/${material.id}`)}
                disabled={isLocked}
                className={`material-item w-full text-left animate-fade-in-up ${
                  isCompleted ? 'bg-emerald-50 border-emerald-200' :
                  isInProgress ? 'bg-blue-50 border-blue-200' :
                  isLocked ? 'opacity-50' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Number/Status Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted ? 'bg-emerald-500 text-white' :
                  isInProgress ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getMaterialIcon(material.type)}</span>
                    <h3 className={`font-semibold line-clamp-1 ${
                      isCompleted ? 'text-emerald-700' : 'text-gray-800'
                    }`}>
                      {material.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{getMaterialTypeText(material.type)}</span>
                    {material.duration > 0 && (
                      <span>{formatDuration(material.duration)}</span>
                    )}
                  </div>

                  {/* Progress Bar for in-progress */}
                  {isInProgress && (
                    <div className="mt-2">
                      <div className="progress-bar h-1">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${material.progress.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow or Lock */}
                <div className="text-gray-400">
                  {isLocked ? (
                    <span className="text-lg">🔒</span>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
