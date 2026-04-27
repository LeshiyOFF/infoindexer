export const checkAuth = (request: Request): boolean => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // При отсутствии ADMIN_PASSWORD доступ запрещён (безопасность по умолчанию).
  if (!adminPassword) {
    return false;
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  return authHeader === adminPassword;
};

export const UNAUTHORIZED_RESPONSE = {
  json: { error: 'Unauthorized: Admin password required' },
  status: 401
};
