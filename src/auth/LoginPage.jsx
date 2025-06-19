import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '/src/assets/ruvm.png';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_ENDPOINT = '/auth/login';

export default function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor ingresa email y contraseña');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}${LOGIN_ENDPOINT}`, {
                email,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_role', user.role);
            localStorage.setItem('user_name', user.name);

            if (onLogin) onLogin(); // notifica al App para actualizar el estado
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Email o contraseña incorrectos');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleLogin}
                className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
            >
                <img src={logo} alt="Logo" className="mx-auto mb-4 w-30 h-30" />
                <h1 className="text-2xl font-bold text-center text-red-600">Iniciar sesión</h1>
                {error && <p className="text-sm text-red-500">{error}</p>}

                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />

                <button
                    type="submit"
                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Entrar
                </button>

                <p className="text-center text-sm">
                    ¿No tienes cuenta?{' '}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Regístrate
                    </a>
                </p>
            </form>
        </div>
    );
}
