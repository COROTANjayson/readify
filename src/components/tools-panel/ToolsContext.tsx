import { createContext, ReactNode, useState } from "react";

type StreamResponse = {
  isToolsMenuOpen: boolean;
  setIsToolsMenuOpen: (isOpen: boolean) => void;
  selectedTools: string;
  handleToolsSelect: (toolsId: string) => void;
};

export const ToolsContext = createContext<StreamResponse>({
  isToolsMenuOpen: true,
  setIsToolsMenuOpen: () => {},
  selectedTools: "chat",
  handleToolsSelect: () => {},
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ToolsContextProvider = ({ children }: Props) => {
  const [selectedTools, setSelectedTools] = useState<string>("chat");
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);

  const handleToolsSelect = (toolsId: string) => {
    setSelectedTools(toolsId);
    setIsToolsMenuOpen(false);
  };

  return (
    <ToolsContext.Provider
      value={{
        isToolsMenuOpen,
        setIsToolsMenuOpen,
        selectedTools,
        handleToolsSelect,
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
};
