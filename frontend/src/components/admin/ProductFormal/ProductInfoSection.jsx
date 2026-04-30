import React from 'react';
import Field, { inputCls } from './Field';

export default function ProductInfoSection({ form, setForm }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Product Info</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Nike Air Max 90" className={inputCls} />
        </Field>
        <Field label="Brand">
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Nike" className={inputCls} />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          placeholder="Short product description..."
          className={`${inputCls} resize-none`}
        />
      </Field>
    </section>
  );
}
