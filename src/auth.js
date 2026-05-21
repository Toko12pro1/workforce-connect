export function isDemoUser(user) {
  return Boolean(user?.user_metadata?.is_demo);
}

export function getRedirectPath(fallback = "/browse") {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  return redirect && redirect.startsWith("/") ? redirect : fallback;
}
