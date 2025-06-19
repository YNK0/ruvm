import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthGuard } from '../../auth/useAuth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TYPE_OPTIONS = ['aula', 'laboratorio', 'sala'];

function EditSpaceModal({ open, space, onClose, onSave }) {
    const [name, setName] = useState(space?.name || '');
    const [type, setType] = useState(space?.type || '');
    const [capacity, setCapacity] = useState(space?.capacity || '');
    const [location, setLocation] = useState(space?.location || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        setName(space?.name || '');
        setType(space?.type || '');
        setCapacity(space?.capacity || '');
        setLocation(space?.location || '');
        setError('');
    }, [space]);

    if (!open) return null;

    const handleSave = async () => {
        if (!TYPE_OPTIONS.includes(type)) {
            setError('El tipo debe ser "aula", "laboratorio" o "sala".');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(
                `${BASE_URL}/spaces/${space._id}`,
                {
                    name,
                    type,
                    capacity,
                    location,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            onSave({ ...space, name, type, capacity, location });
            onClose();
            window.location.reload(); // Recarga la página después de guardar
        } catch (err) {
            setError('Error al guardar los cambios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold mb-2">Editar espacio</h2>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <label className="block text-sm">Nombre</label>
                <input
                    className="w-full border rounded p-2 mb-2"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <label className="block text-sm">Tipo</label>
                <select
                    className="w-full border rounded p-2 mb-2"
                    value={type}
                    onChange={e => setType(e.target.value)}
                >
                    <option value="">Selecciona un tipo</option>
                    {TYPE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                </select>
                <label className="block text-sm">Capacidad</label>
                <input
                    type="number"
                    className="w-full border rounded p-2 mb-2"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                />
                <label className="block text-sm">Ubicación</label>
                <input
                    className="w-full border rounded p-2 mb-2"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SpaceCard({ space, userRole = '', onReserve, onEdit, onDelete }) {
    useAuthGuard()

    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);

    const handleSave = (updatedSpace) => {
        setShowEditModal(false);
        if (onEdit) onEdit(updatedSpace);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md space-y-2 border border-gray-200">
            <div className="flex items-center gap-2">
                <span className="material-icons text-3xl text-primary">meeting_room</span>
                <h2 className="text-xl font-bold text-gray-900">{space.name}</h2>
            </div>
            <p className="text-sm text-gray-600">Tipo: {space.type}</p>
            <p className="text-sm text-gray-600">Capacidad: {space.capacity}</p>
            <p className="text-sm text-gray-600">Ubicación: {space.location}</p>

            {userRole === 'admin' && (
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(space)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Eliminar
                    </button>
                </div>
            )}

            <button
                onClick={() => navigate(`/reserve/${space._id}/${space.name}`)}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary mt-2 flex items-center justify-between"
            >
                Reservar
                <span className="material-icons text-xl">add_circle_outline</span>
            </button>
            <button
                onClick={() => navigate(`/availability/${space._id}`)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-secondary mt-2 flex items-center justify-between"
            >
                <span>Ver disponibilidad</span>
                <span className="material-icons text-xl">event</span>
            </button>

            <EditSpaceModal
                open={showEditModal}
                space={space}
                onClose={() => setShowEditModal(false)}
                onSave={handleSave}
            />
        </div>
    );
}