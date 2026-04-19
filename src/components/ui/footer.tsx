interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    url?: string;
    onClick?: () => void;
  }[];
}

interface FooterProps {
  logo?: {
    src: string;
    alt: string;
    title: string;
    onClick?: () => void;
  };
  tagline?: string;
  menuItems?: FooterMenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url?: string;
    onClick?: () => void;
  }[];
}

const Footer = ({
  logo,
  tagline,
  menuItems = [],
  copyright,
  bottomLinks = [],
}: FooterProps) => {
  return (
    <footer className="py-16 px-6 md:px-12 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          {/* Logo + tagline */}
          <div className="col-span-2 mb-8 lg:mb-0">
            {logo && (
              <div className="flex items-center gap-2">
                {logo.onClick ? (
                  <button onClick={logo.onClick} className="focus:outline-none">
                    <img src={logo.src} alt={logo.alt} className="h-8" />
                  </button>
                ) : (
                  <img src={logo.src} alt={logo.alt} className="h-8" />
                )}
              </div>
            )}
            {tagline && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {tagline}
              </p>
            )}
          </div>

          {/* Menu columns */}
          {menuItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                      >
                        {link.text}
                      </button>
                    ) : (
                      <a
                        href={link.url ?? "#"}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                      >
                        {link.text}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-gray-200 dark:border-gray-800 pt-5 md:flex-row md:items-center">
          {copyright && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{copyright}</p>
          )}
          {bottomLinks.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                    >
                      {link.text}
                    </button>
                  ) : (
                    <a
                      href={link.url ?? "#"}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                    >
                      {link.text}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export type { FooterProps, FooterMenuItem };
