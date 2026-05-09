import { useState } from 'react';
import Button from '../../components/ui/Button';
// eslint-disable-next-line
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { crearFalla } from './fallaService';

const CATEGORIAS = [
  'Fisuras y grietas',
  'Humedad y filtraciones',
  'Instalación eléctrica',
  'Instalación sanitaria',
  'Terminaciones',
  'Estructura',
  'Cubiertas y techumbres',
  'Ventanas y puertas',
  'Otro',
];

const GRAVEDADES = ['Baja', 'Media', 'Alta'];

export default function FallaForm({ idRevision, onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ categoria_falla: CATEGORIAS[0], nivel_gravedad: 'Media', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.descripcion.trim()) e.descripcion = 'Ingrese una descripción';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await crearFalla({
        id_revision: parseInt(idRevision),
        categoria_falla: form.categoria_falla,
        nivel_gravedad: form.nivel_gravedad,
        descripcion: form.descripcion,
      });
      setForm({ categoria_falla: CATEGORIAS[0], nivel_gravedad: 'Media', descripcion: '' });
      setErrors({});
      setOpen(false);
      onCreated();
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al registrar falla');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-zinc-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all py-4 text-zinc-500 hover:text-amber-400 font-mono text-sm uppercase tracking-widest"
      >
        + Registrar nueva falla
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border-2 border-amber-500/40 p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">Nueva falla</p>
        <button type="button" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-lg leading-none">&times;</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Categoría"
          value={form.categoria_falla}
          onChange={(e) => setForm({ ...form, categoria_falla: e.target.value })}
        >
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select
          label="Gravedad"
          value={form.nivel_gravedad}
          onChange={(e) => setForm({ ...form, nivel_gravedad: e.target.value })}
        >
          {GRAVEDADES.map((g) => <option key={g} value={g}>{g}</option>)}
        </Select>
      </div>

      <Textarea
        label="Descripción de la falla"
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        error={errors.descripcion}
        placeholder="Describa la falla encontrada, ubicación exacta, extensión del daño..."
        rows={3}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar falla'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  );
}