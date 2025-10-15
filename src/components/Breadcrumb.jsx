import { Link } from "react-router-dom";

export default function Breadcrumb({ items }) {
  return (
    <nav className="text-sm text-gray-400 mb-6">
      <ol className="flex flex-wrap items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index < items.length - 1 ? (
              <>
                <Link
                  to={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
                <span className="mx-2">›</span>
              </>
            ) : (
              <span className="text-white font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
