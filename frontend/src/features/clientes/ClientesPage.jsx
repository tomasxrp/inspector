import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getClientes, eliminarCliente } from './clienteService';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch {
      setError('No se pudieron cargar los clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // eslint-disable-next-line 
    fetchClientes(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eliminarCliente(deleteTarget.correo);
      setClientes((prev) => prev.filter((c) => c.correo !== deleteTarget.correo));
      setDeleteTarget(null);
    } catch {
      alert('No se pudo eliminar el cliente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} registros`}
        actions={
          <Button onClick={() => navigate('/clientes/nuevo')}>
            + Nuevo cliente
          </Button>
        }
      />

      <div className="p-8">
        {loading && <LoadingSpinner text="Cargando clientes..." />}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm font-mono">{error}</div>
        )}

        {!loading && !error && clientes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">Sin clientes registrados</p>
            <Button className="mt-4" onClick={() => navigate('/clientes/nuevo')}>+ Agregar primero</Button>
          </div>
        )}

        {!loading && clientes.length > 0 && (
          <div className="border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800/50 border-b border-zinc-700">
                  {['ID', 'Nombre', 'Correo', 'Teléfono', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, i) => (
                  <tr key={c.id} className={`border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/30'}`}>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-500">#{c.id}</td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-100">{c.nombre} {c.apellido}</td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-400">{c.correo}</td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-400">{c.telefono}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/clientes/${c.correo}/editar`)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(c)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar eliminación">
        <p className="text-zinc-300 text-sm font-mono mb-6">
          ¿Eliminar al cliente <span className="text-amber-400">{deleteTarget?.nombre} {deleteTarget?.apellido}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}