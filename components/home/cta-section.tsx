export function CTASection({
  primaryText,
  secondaryText,
  primaryHref,
  secondaryHref,
  isSecondaryOutline = false
}: {
  primaryText: string;
  secondaryText: string;
  primaryHref: string;
  secondaryHref: string;
  isSecondaryOutline?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <a
        href={primaryHref}
        className={`flex-1 px-6 py-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center`}>
        {primaryText}
      </a>
      <a
        href={secondaryHref}
        className={`flex-1 px-6 py-4 ${isSecondaryOutline ? 'border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-500' : 'bg-gray-50 text-gray-900'} text-center font-medium rounded-lg hover:bg-gray-100 transition-all`}>
        {secondaryText}
      </a>
    </div>
  );
}