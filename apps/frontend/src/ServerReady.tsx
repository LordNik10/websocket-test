import { useEffect, useState } from "react";

export function ServerReady({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getServerStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}`);
        if (!response.ok) {
          throw new Error("Server is not ready");
        }
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error fetching server status:", error);
        setIsLoading(false);
        return false;
      }
    };
    getServerStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-lg">Server is not ready</div>
        <div className="text-white text-lg">Please wait...</div>
      </div>
    );
  }

  return children;
}
