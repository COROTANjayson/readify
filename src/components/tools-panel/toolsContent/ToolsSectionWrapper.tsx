import { ReactNode } from "react";

interface ToolsSectionWrapperProps {
  children: ReactNode;
  className?: string;
}

const ToolsSectionWrapper = ({ children, className = "" }: ToolsSectionWrapperProps) => {
  return <section className={`p-6 space-y-6 ${className}`}>{children}</section>;
};

export default ToolsSectionWrapper;
