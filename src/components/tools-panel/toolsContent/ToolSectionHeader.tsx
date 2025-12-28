import ToolsUsageInfo, { ToolKey } from "./ToolsUsageInfo";

interface ToolSectionHeaderProps {
  title: string;
  description?: string;
  toolType: ToolKey;
}

const ToolSectionHeader = ({ title, description, toolType }: ToolSectionHeaderProps) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 space-y-1">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 max-w-prose">{description}</p>}
      </div>
      <div className="shrink-0">
        <ToolsUsageInfo type={toolType} />
      </div>
    </div>
  );
};

export default ToolSectionHeader;
