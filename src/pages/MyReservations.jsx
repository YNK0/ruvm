import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { useAuthGuard } from '../auth/useAuth';

const RESERVE_URL = import.meta.env.VITE_API_BASE_URL + '/bookings';
const STATUS_URL = `${RESERVE_URL}/status`;

function parseDate(dateStr) {
    return new Date(dateStr);
}

function isUpcoming(end) {
    return new Date(end) > new Date();
}

export default function MyReservationsPage() {
    useAuthGuard()
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState({ message: '', severity: '' });
    const navigate = useNavigate();

    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const { data } = await axios.get(`${RESERVE_URL}?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const upcoming = data
                    .map(o => ({
                        bookingId: o._id,
                        spaceName: o.space.name,
                        location: o.space.location || '',
                        startTimeRaw: o.startTime,
                        endTimeRaw: o.endTime,
                        status: o.status
                    }))
                    .filter(r => isUpcoming(r.endTimeRaw))
                    .sort((a, b) => parseDate(a.startTimeRaw) - parseDate(b.startTimeRaw));

                setReservations(upcoming);
            } catch (err) {
                console.error(err);
                setError('Error al cargar reservas');
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [userId, token]);

    const cancelReservation = async (reservationId) => {
        try {
            await axios.put(STATUS_URL, {
                bookingId: reservationId,
                status: 'cancelled'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setAlert({ message: 'Reserva cancelada correctamente', severity: 'success' });
            setLoading(true);
            setError('');
            // Vuelve a cargar las reservas
            const { data } = await axios.get(`${RESERVE_URL}?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const upcoming = data
                .map(o => ({
                    bookingId: o._id,
                    spaceName: o.space.name,
                    location: o.space.location || '',
                    startTimeRaw: o.startTime,
                    endTimeRaw: o.endTime,
                    status: o.status
                }))
                .sort((a, b) => parseDate(a.startTimeRaw) - parseDate(b.startTimeRaw));

            setReservations(upcoming);
        } catch (err) {
            console.error(err);
            setAlert({ message: 'Error al cancelar la reserva', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Cargando...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(' de ', ' de ').replace(',', ' ');
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {alert.message && (
                <Alert
                    severity={alert.severity}
                    onClose={() => setAlert({ message: '', severity: '' })}
                    className="mb-4"
                >
                    {alert.message}
                </Alert>
            )}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
                ← Regresar
            </button>
            <h1 className="text-2xl font-bold mb-4">Mis Reservas</h1>
            {reservations.length === 0 ? (
                <p className="text-center text-gray-500">No tienes reservas próximas.</p>
            ) : (
                <div className="space-y-4">
                    {reservations.map(r => (
                        <div key={r.bookingId} className="p-4 border rounded-xl bg-white shadow">
                            <h2 className="text-lg font-semibold">{r.spaceName}</h2>
                            <p className="text-sm text-gray-600">Ubicación: {r.location}</p>
                            <p className="text-sm text-gray-600">
                                De: {formatDate(r.startTimeRaw)}<br />
                                A: {formatDate(r.endTimeRaw)}
                            </p>
                            <p className="text-sm text-gray-500">Estado: {r.status}</p>
                            {r.status !== 'cancelled' && (
                                <button
                                    onClick={() => cancelReservation(r.bookingId)}
                                    className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}