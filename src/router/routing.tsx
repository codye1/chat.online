import {
  Navigate,
  Route,
  Routes,
  matchPath,
  useLocation,
} from "react-router-dom";
import Auth from "../pages/Auth/Auth.tsx";
import { useAppSelector } from "@hooks/hooks.ts";
import routePages from "./routePages.ts";

const Routing = () => {
  const isAuth = useAppSelector((state) => state.auth.isAuth);
  const location = useLocation();

  const authLoginUrl = `/auth?url=${encodeURIComponent(
    `${location.pathname}${location.search}${location.hash}`,
  )}`;

  const isKnownAppPath = (pathname: string) =>
    routePages.some((route) =>
      matchPath({ path: route.path, end: true }, pathname),
    );

  const authRedirectTarget = (() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("url");
    if (!raw) return "/";

    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      // ignore malformed encoding
    }

    const target = decoded.trim();

    // Basic safety + avoid loops.
    // - only allow in-app absolute paths
    // - block protocol-relative URLs like "//evil.com"
    // - block backslashes to avoid weird path parsing edge-cases
    if (
      !target.startsWith("/") ||
      target.startsWith("//") ||
      target.includes("\\") ||
      target.startsWith("/auth")
    ) {
      return "/";
    }

    const pathname = target.split(/[?#]/, 1)[0];
    if (!isKnownAppPath(pathname)) return "/";

    return target;
  })();

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          isAuth ? <Navigate to={authRedirectTarget} replace /> : <Auth />
        }
      />

      {routePages.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={
            isAuth ? <route.element /> : <Navigate to={authLoginUrl} replace />
          }
        />
      ))}

      <Route
        path="*"
        element={<Navigate to={isAuth ? "/" : authLoginUrl} replace />}
      />
    </Routes>
  );
};

export default Routing;
