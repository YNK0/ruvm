import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateAdmin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({ message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ message: '', severity: '' });
        try {
            await axios.post(`${BASE_URL}/auth/register-admin`, {
                name,
                email,
                password,
                role: 'admin'
            });
            setAlert({ message: 'Administrador creado correctamente', severity: 'success' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            let errorMsg = 'Error al crear administrador';
            if (err.response && err.response.data && err.response.data.error) {
                errorMsg = err.response.data.error;
            }
            setAlert({ message: errorMsg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow space-y-4">
            <h2 className="text-xl font-bold text-center text-primary">Crear usuario administrador</h2>
            {alert.message && (
                <Alert severity={alert.severity} onClose={() => setAlert({ message: '', severity: '' })}>
                    {alert.message}
                </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Nombre</label>
                    <input
                        className="w-full border rounded p-2"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        className="w-full border rounded p-2"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Contraseña</label>
                    <input
                        type="password"
                        className="w-full border rounded p-2"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 bg-primary text-white rounded hover:secondary"
                    disabled={loading}
                >
                    {loading ? 'Creando...' : 'Crear usuario administrador'}
                </button>
            </form>
            <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-2 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
                Cancelar
            </button>
        </div>
    );
}