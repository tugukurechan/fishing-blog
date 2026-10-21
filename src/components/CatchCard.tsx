type Props = {
  fish: string;
  size?: string;
  /** ルアーやエサ */
  bait?: string;
  time?: string;
  className?: string;
};

/** 記事の中で1匹ごとの釣果を目立たせるカード。<CatchCard fish="シーバス" size="62cm" /> */
export function CatchCard({ fish, size, bait, time, className = "" }: Props) {
  const rows = [
    ["サイズ", size],
    ["ルアー・エサ", bait],
    ["時間", time],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className={`not-prose my-6 rounded-xl border border-sky-100 bg-sky-50 p-4 ${className}`}>
      <p className="text-xs font-bold tracking-widest text-sky-700">CATCH</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{fish}</p>
      {rows.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
