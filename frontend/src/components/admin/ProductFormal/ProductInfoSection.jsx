import React from 'react';
import Field, { inputCls } from './Field';
import Dropdown from '../../ui/Dropdown';
import { User, Users, Sparkles } from 'lucide-react';

export default function ProductInfoSection({ form, setForm, isSuperAdmin }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Product Info</p>
      <Field label="Name">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Nike Air Max 90" disabled={!isSuperAdmin} className={`${inputCls} disabled:opacity-50`} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand">
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Nike" disabled={!isSuperAdmin} className={`${inputCls} disabled:opacity-50`} />
        </Field>
        <Field label="Gender">
          {isSuperAdmin ? (
            <Dropdown
              value={form.gender || 'Unisex'}
              onChange={(val) => setForm(prev => ({ ...prev, gender: val }))}
              options={[
                { value: 'Men', label: 'Men', Icon: User },
                { value: 'Women', label: 'Women', Icon: Sparkles },
                { value: 'Unisex', label: 'Unisex', Icon: Users },
              ]}
              className="w-full"
              buttonClassName="w-full flex items-center justify-between !bg-brand-bg/50 !border-black/5 !rounded-xl !py-3 !px-4 !text-sm !font-bold !normal-case !tracking-normal shadow-none hover:!border-black/20"
            />
          ) : (
            <div className="w-full flex items-center justify-between bg-black/5 border border-transparent rounded-xl py-3 px-4 text-sm font-bold opacity-50 cursor-not-allowed">
              {form.gender || 'Unisex'}
            </div>
          )}
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
