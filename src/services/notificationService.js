import api from "./api";

/**
 * Fetch current user's notifications
 * GET /notifications
 */
export const getMyNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

/**
 * Get count of unread notifications
 * GET /notifications/unread-count
 */
export const getUnreadNotificationCount = async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data?.unreadCount ?? 0;
};

export const getUnreadCount = getUnreadNotificationCount;

/**
 * Mark a single notification as read
 * PATCH /notifications/{id}/read
 */
export const markNotificationAsRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 * PATCH /notifications/mark-all-read
 */
export const markAllNotificationsAsRead = async () => {
    const response = await api.patch("/notifications/mark-all-read");
    return response.data;
};

/**
 * Delete a single notification
 * DELETE /notifications/{id}
 */
export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};

/**
 * Clear all notifications for current user
 * DELETE /notifications/all
 */
export const clearAllNotifications = async () => {
    const response = await api.delete("/notifications/all");
    return response.data;
};
