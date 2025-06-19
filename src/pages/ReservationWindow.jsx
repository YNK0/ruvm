import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import { format, addMinutes } from 'date-fns';
import { useAuthGuard } from '../auth/useAuth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ReservePage() {
    useAuthGuard()
    const { id, name } = useParams();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [alert, setAlert] = useState({ message: '', severity: '' });
    const navigate = useNavigate();

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            setAlert({ message: 'Por favor selecciona fecha y hora', severity: 'warning' });
            return;
        }

        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');

        if (!token || !userId) {
            setAlert({ message: 'No autenticado', severity: 'error' });
            return;
        }

        // Combina fecha y hora seleccionadas
        const start = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0
        );
        const end = addMinutes(start, 60);

        const startTime = format(start, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        const endTime = format(end, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

        try {
            await axios.post(
                `${BASE_URL}/bookings`,
                {
                    spaceId: id,
                    userId,
                    startTime,
                    endTime,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setAlert({ message: 'Reserva confirmada 😃', severity: 'success' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            console.error(err);
            setAlert({ message: 'Es posible que el espacio no esté disponible, prueba con otro horario', severity: 'error' });
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-xl shadow space-y-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
                ← Regresar
            </button>
            <h2 className="text-xl font-bold text-center text-red-600">Reservar: {name}</h2>

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
                <div>
                    <label className="block text-sm mb-1 mt-2">Selecciona una hora:</label>
                    <TimePicker
                        value={selectedTime}
                        onChange={setSelectedTime}
                        ampm={false}
                        slotProps={{
                            textField: { fullWidth: true, size: 'small', className: 'bg-white' }
                        }}
                        format="HH:mm"
                    />
                </div>
            </LocalizationProvider>

            <button
                onClick={handleConfirm}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mt-2"
            >
                Confirmar Reserva
            </button>
        </div>
    );
}