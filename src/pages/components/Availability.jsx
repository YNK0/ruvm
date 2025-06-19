import { useState } from 'react';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import { format, isAfter, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../../auth/useAuth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function isUpcoming(booking) {
    try {
        const now = new Date();
        return isAfter(parseISO(booking.endTime), now);
    } catch {
        return false;
    }
}

export default function Availability() {
    useAuthGuard()

    const navigate = useNavigate();
    const { spaceId } = useParams();
    const [selectedDate, setSelectedDate] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ message: '', severity: '' });
    const [hasSearched, setHasSearched] = useState(false);

    const handleCheckAvailability = async () => {
        if (!selectedDate) {
            setAlert({ message: 'Primero selecciona una fecha', severity: 'warning' });
            return;
        }
        setLoading(true);
        setAlert({ message: '', severity: '' });
        setHasSearched(true);

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const url = `${BASE_URL}/spaces/${spaceId}/availability/${dateStr}`;
            const { data } = await axios.get(url);

            const list = (data || [])
                .map(obj => ({
                    spaceName: obj.space?.name || 'Espacio eliminado',
                    location: obj.space?.location || 'Sin ubicación',
                    startTime: obj.startTime,
                    endTime: obj.endTime,
                    status: obj.status,
                    userName: obj.user?.name || 'Desconocido'
                }))
                .filter(isUpcoming);

            setBookings(list);
            if (list.length === 0) {
                setAlert({ message: 'No hay reservas para esta fecha.', severity: 'info' });
            }
        } catch (err) {
            setAlert({ message: 'Error al obtener disponibilidad', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow space-y-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
                ← Regresar
            </button>
            <h2 className="text-xl font-bold text-center text-red-600 mb-2">Disponibilidad del espacio</h2>

            {alert.message && (
                <Alert severity={alert.severity} onClose={() => setAlert({ message: '', severity: '' })}>
                    {alert.message}
                </Alert>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                <div>
                    <label className="block text-sm mb-1">Selecciona una fecha:</label>
                    <DatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        minDate={new Date()}
                        slotProps={{
                            textField: { fullWidth: true, size: 'small', className: 'bg-white' }
                        }}
                        format="dd/MM/yyyy"
                    />
                </div>
            </LocalizationProvider>

            <button
                onClick={handleCheckAvailability}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-red-700 mt-2"
                disabled={loading}
            >
                {loading ? 'Buscando...' : 'Consultar disponibilidad'}
            </button>

            <div className="mt-4">
                {hasSearched && bookings.length === 0 && !loading ? (
                    <p className="text-center text-gray-500">No hay reservas para mostrar.</p>
                ) : (
                    <ul className="space-y-3">
                        {bookings.map((b, idx) => (
                            <li key={idx} className="border rounded-lg p-3 bg-gray-50">
                                <div className="font-semibold">{b.spaceName}</div>
                                <div className="text-sm text-gray-600">Ubicación: {b.location}</div>
                                <div className="text-sm text-gray-600">
                                    De: {format(parseISO(b.startTime), 'dd/MM/yyyy HH:mm')}
                                    <br />
                                    A: {format(parseISO(b.endTime), 'dd/MM/yyyy HH:mm')}
                                </div>
                                <div className="text-sm text-gray-500">Estado: {b.status}</div>
                                <div className="text-sm text-gray-500">Usuario: {b.userName}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}