import React from "react";
import { AlertCircle, FileX, Loader2 } from "lucide-react";

interface StateDisplayProps {
  state: "loading" | "error" | "notFound";
  message?: string;
  backLabel?: string;
  onBack?: () => void;
  backRoute?: string;
}

export const StateDisplay: React.FC<StateDisplayProps> = ({
  state,
  message,
  backLabel = "Go Back",
  onBack,
  backRoute,
}) => {
  const config = {
    loading: {
      icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
      title: null,
      message: message || "Loading...",
      showButton: false,
    },
    error: {
      icon: <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />,
      title: "Error",
      titleColor: "text-red-600",
      message: message || "Something went wrong",
      showButton: true,
    },
    notFound: {
      icon: <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />,
      title: "Not Found",
      titleColor: "text-gray-800",
      message: message || "Content not found",
      showButton: true,
    },
  };

  const current = config[state];

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backRoute) {
      console.log(`Navigate to: ${backRoute}`);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex items-center justify-center w-full ">
      <div className="flex flex-col items-center justify-center text-center ">
        {current.icon}
        {current.title && <h2 className={`text-xl font-semibold mb-2 ${current.titleColor}`}>{current.title}</h2>}
        <p className="text-gray-600 mb-4">{current.message}</p>
        {current.showButton && (
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
};
