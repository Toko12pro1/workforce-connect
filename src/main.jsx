import React from "react";
import { createRoot } from "react-dom/client";
import { LogOut } from "lucide-react";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CreateAccountPage from "./pages/CreateAccountPage.jsx";
import BrowseWorkersPage from "./pages/BrowseWorkersPage.jsx";
import AddPortfolioPage from "./pages/AddPortfolioPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import JobDetailsPage from "./pages/JobDetailsPage.jsx";
import JobLocationBudgetPage from "./pages/JobLocationBudgetPage.jsx";
import JobVisualsPage from "./pages/JobVisualsPage.jsx";
import JobPostedSuccessPage from "./pages/JobPostedSuccessPage.jsx";
import WorkerDashboardPage from "./pages/WorkerDashboardPage.jsx";
import WorkerOnboardingPage from "./pages/WorkerOnboardingPage.jsx";
import WorkerProfilePage from "./pages/WorkerProfilePage.jsx";
// New pages
import FeedPage from "./pages/FeedPage.jsx";
import CreateFeedPostPage from "./pages/CreateFeedPostPage.jsx";
import FeedPostDetailPage from "./pages/FeedPostDetailPage.jsx";
import InternshipsPage from "./pages/InternshipsPage.jsx";
import InternshipDetailPage from "./pages/InternshipDetailPage.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import MyApplicationsPage from "./pages/MyApplicationsPage.jsx";
import SMEOnboardingPage from "./pages/SMEOnboardingPage.jsx";
import SMEPortalPage from "./pages/SMEPortalPage.jsx";
import SMEPublicProfilePage from "./pages/SMEPublicProfilePage.jsx";
import PublicWorkerProfilePage from "./pages/PublicWorkerProfilePage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import RoleSelectPage from "./pages/RoleSelectPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.js";
import { LanguageProvider, LanguageToggle } from "./i18n.jsx";
import "./styles.css";

function matchDynamicRoute(path) {
  if (path.startsWith("/profile/")) return <PublicWorkerProfilePage id={path.split("/")[2]} />;
  if (path.startsWith("/sme/")) return <SMEPublicProfilePage id={path.split("/")[2]} />;
  if (path.startsWith("/internship/")) return <InternshipDetailPage id={path.split("/")[2]} />;
  if (path.startsWith("/feed/")) return <FeedPostDetailPage id={path.split("/")[2]} />;
  return null;
}

const STATIC_ROUTES = {
  "/feed": <FeedPage />,
  "/browse": <BrowseWorkersPage />,
  "/add-portfolio": <AddPortfolioPage />,
  "/create-post": <CreateFeedPostPage />,
  "/chat": <ChatPage />,
  "/post-job-details": <JobDetailsPage />,
  "/post-job-location": <JobLocationBudgetPage />,
  "/post-job-visuals": <JobVisualsPage />,
  "/job-posted": <JobPostedSuccessPage />,
  "/worker-dashboard": <WorkerDashboardPage />,
  "/worker-setup": <WorkerOnboardingPage />,
  "/worker-onboarding": <WorkerOnboardingPage />,
  "/worker-profile": <WorkerProfilePage />,
  "/internships": <InternshipsPage />,
  "/apply": <ApplyPage />,
  "/my-applications": <MyApplicationsPage />,
  "/sme-setup": <SMEOnboardingPage />,
  "/sme-portal": <SMEPortalPage />,
  "/notifications": <NotificationsPage />,
  "/role-select": <RoleSelectPage />,
  "/admin": <AdminPage />
};

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set(["/login", "/create-account", "/role-select", "/feed", "/browse", "/internships", "/admin"]);

function App() {
  const path = window.location.pathname;
  const { user, loading, signOut } = useAuth();

  function withControls(page, showLogout = false) {
    return (
      <>
        {page}
        <div className="global-controls">
          <LanguageToggle />
          {showLogout && (
            <button
              className="account-logout"
              type="button"
              aria-label="Logout"
              onClick={async () => {
                await signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </>
    );
  }

  if (loading) {
    return <div className="app-loading" aria-busy="true" aria-label="Loading" />;
  }

  if (path === "/login") return withControls(<LoginPage />);

  if (path === "/logout") {
    signOut().then(() => window.location.replace("/login"));
    return <div className="app-loading" aria-busy="true" />;
  }

  if (path === "/create-account") return withControls(<CreateAccountPage />);

  // Try dynamic routes first
  const dynamicPage = matchDynamicRoute(path);
  if (dynamicPage) {
    return withControls(dynamicPage, !!user);
  }

  // Try static routes
  const staticPage = STATIC_ROUTES[path];
  if (staticPage) {
    if (!user && !PUBLIC_ROUTES.has(path)) {
      return withControls(
        <CreateAccountPage
          authNotice="Créez un compte gratuit pour accéder à Workforce Connect."
          redirectTo={path}
        />
      );
    }
    return withControls(staticPage, !!user);
  }

  // Default: authenticated → /feed, unauthenticated → landing
  return withControls(user ? <FeedPage /> : <LandingPage />);
}

createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LanguageProvider>
);
