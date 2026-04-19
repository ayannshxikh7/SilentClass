export default function FormInput({ label, type = 'text', error, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        className={`w-full rounded-xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-500 ${
          error ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'
        }`}
        {...props}
      />
      {error ? <span className="text-xs font-semibold text-rose-500">{error}</span> : null}
    </label>
  );
}
