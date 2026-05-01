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
      <Field label="Name">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Nike Air Max 90" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand">
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Nike" className={inputCls} />
        </Field>
        <Field label="Gender">
          <select name="gender" value={form.gender || 'Unisex'} onChange={handleChange} className={inputCls}>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
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
