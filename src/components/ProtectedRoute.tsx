// admin/components/ProtectedRoute.tsx
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  // 🚀 Demo mode — skip login checks
  // Always show the page, no matter if there's a token or not
  return children;
}
