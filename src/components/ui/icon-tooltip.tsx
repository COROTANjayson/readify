import { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type IconTooltipProps = {
  icon: ReactNode;
  label: string;
  className?: string;
};

export const IconTooltip = ({ icon, label, className }: IconTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{icon}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
