/**
 * Courses Service
 * Handles online courses operations
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../utils/config.js';

class CoursesService {
  /**
   * Get all courses
   */
  async getCourses(skip = 0, limit = 10, publishedOnly = true) {
    try {
      const url = `${API_ENDPOINTS.courses.list}?skip=${skip}&limit=${limit}&published_only=${publishedOnly}`;
      return await apiService.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId) {
    try {
      return await apiService.get(API_ENDPOINTS.courses.detail(courseId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create course
   */
  async createCourse(title, price, description = '', durationHours = null) {
    try {
      return await apiService.post(API_ENDPOINTS.courses.create, {
        title,
        price,
        description,
        duration_hours: durationHours,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(courseId, title, price, description, durationHours, isPublished) {
    try {
      return await apiService.put(API_ENDPOINTS.courses.update(courseId), {
        title,
        price,
        description,
        duration_hours: durationHours,
        is_published: isPublished,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId) {
    try {
      return await apiService.delete(API_ENDPOINTS.courses.delete(courseId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get course lessons
   */
  async getLessons(courseId) {
    try {
      return await apiService.get(API_ENDPOINTS.courses.lessons(courseId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create lesson
   */
  async createLesson(courseId, title, content = '', videoUrl = '', order = 1, durationMinutes = null) {
    try {
      return await apiService.post(API_ENDPOINTS.courses.createLesson(courseId), {
        title,
        content,
        video_url: videoUrl,
        order,
        duration_minutes: durationMinutes,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enroll in course
   */
  async enrollCourse(courseId) {
    try {
      return await apiService.post(API_ENDPOINTS.courses.enroll(courseId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrolled courses
   */
  async getEnrolledCourses() {
    try {
      return await apiService.get(API_ENDPOINTS.courses.enrolledCourses);
    } catch (error) {
      throw error;
    }
  }
}

export const coursesService = new CoursesService();
export default coursesService;
