import { QrCode } from "lucide-react";

export function QRCodeSection() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border/50">
      <div className="relative overflow-hidden">
        <div className="relative px-6 py-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl opacity-20"></div>
              <QrCode className="w-24 h-24" size={24} color="currentColor" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Scan to Access ClassQuest
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Scan the QR code with your phone to instantly access your courses, notes, quizzes, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="flex-1 px-4 py-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg text-center font-medium hover:opacity-90 transition-opacity">
              Download App
            </a>
            <a href="#" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-indigo-500 hover:text-indigo-500 transition-all">
              Web Version
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}