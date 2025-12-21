import { BookOpen, MessageSquare, Presentation, Sparkles } from "lucide-react";

export interface Feature {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export const tools: Feature[] = [
  {
    id: "chat",
    name: "Chat with PDF",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Ask questions about the document",
  },
  {
    id: "summarize",
    name: "Summarize",
    icon: <BookOpen className="w-5 h-5" />,
    description: "Get a summary of the content",
  },
  {
    id: "ppt",
    name: "Create PPT",
    icon: <Presentation className="w-5 h-5" />,
    description: "Generate presentation slides",
  },
  {
    id: "insights",
    name: "AI Insights",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Get key insights and analysis",
  },
];
