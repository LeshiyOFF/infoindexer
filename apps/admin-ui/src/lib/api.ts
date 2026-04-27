/**
 * Возвращает заголовки авторизации для API-запросов.
 * Использует пароль из sessionStorage (пользователь должен быть авторизован).
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const pwd = sessionStorage.getItem('admin_password') ?? '';
  return pwd ? { Authorization: pwd } : {};
}

