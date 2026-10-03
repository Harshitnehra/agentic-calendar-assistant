import { useSession } from "@descope/react-sdk";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isSessionLoading, navigate]);

  if (isSessionLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return children;
}
