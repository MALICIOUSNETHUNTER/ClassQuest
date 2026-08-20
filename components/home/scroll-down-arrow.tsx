import { ChevronDown } from "lucide-react";

export function ScrollDownArrow() {
  return (
    <div className="flex items-center justify-center mt-8">
      <a href="#how-it-works" className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        <span>How it works</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-300" />
      </a>
    </div>
  );
}