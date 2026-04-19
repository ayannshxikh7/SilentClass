import { motion } from 'framer-motion';

export default function AuthShell({ title, subtitle, children, sideContent }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-sky-50 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 p-4 md:grid-cols-2 md:p-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-2 rounded-3xl bg-white p-8 shadow-card md:order-1 md:p-12"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">SilentClass</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
          <p className="mt-3 text-base text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-1 flex flex-col justify-between rounded-3xl bg-slate-900 p-8 text-white shadow-card md:order-2 md:p-12"
        >
          {sideContent}
        </motion.section>
      </div>
    </div>
  );
}
