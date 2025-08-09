export const roleHome = (role: string) =>
  role === 'admin' ? '/admin' :
  role === 'mentor' ? '/mentor/dashboard' :
  '/learner/dashboard';
