import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '/src/assets/small.png';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REGISTER_ENDPOINT = '/auth/register';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;

        if (!name || !email || !password) {
            setError('Completa todos los campos');
            return;
        }

        if (!emailRegex.test(email)) {
            setError('Correo electrónico no válido');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}${REGISTER_ENDPOINT}`, {
                name,
                email,
                password
            });

            const { token, user } = response.data;

            // Guardar en localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_name', user.name);
            localStorage.setItem('user_email', user.email);
            localStorage.setItem('user_role', 'user'); // Asumiendo que todos los registrados son "user"

            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Error al registrar. Intenta con otro correo.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleRegister}
                className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
            >
                <img src={logo} alt="Logo" className="mx-auto mb-4 w-30 h-30" />
                <h1 className="text-2xl font-bold text-center text-red-600">Crear cuenta</h1>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <input
                    type="text"
                    placeholder="Nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                    type="password"
                    placeholder="Contraseña (mínimo 8 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />

                <button
                    type="submit"
                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Registrarse
                </button>

                <p className="text-center text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Inicia sesión
                    </a>
                </p>
            </form>
        </div>
    );
}
