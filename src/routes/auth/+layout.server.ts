export const load = async ({ url }) => {
  const next = url.searchParams.get('next') ?? '/dashboard';
  return { next };
};
