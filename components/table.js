export function Table({ children }) {
  return <table className="w-full text-sm">{children}</table>;
}

export function THead({ children }) {
  return (
    <thead className="border-b text-xs text-gray-500 uppercase">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children }) {
  return (
    <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition">
      {children}
    </tr>
  );
}

export function TH({ children }) {
  return <th className="px-4 py-3 text-left">{children}</th>;
}

export function TD({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}
