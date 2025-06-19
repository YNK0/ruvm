import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AddSpaceModal from './components/AddSpaceModal'
import SpaceCard from './components/Space'
import Alert from '@mui/material/Alert'
import { useAuthGuard } from '../auth/useAuth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Dashboard() {
    useAuthGuard()

    const [spaces, setSpaces] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [alert, setAlert] = useState({ message: '', severity: '' })

    const fetchSpaces = async () => {
        const token = localStorage.getItem('auth_token')
        try {
            const response = await axios.get(`${BASE_URL}/spaces?tipo=aula`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSpaces(response.data)
        } catch (err) {
            console.error('Error al cargar espacios:', err)
            setAlert({ message: 'Error al cargar espacios', severity: 'error' })
        }
    }

    useEffect(() => {
        fetchSpaces()
    }, [])

    const navigate = useNavigate()
    const userName = localStorage.getItem('user_name') || 'Usuario'
    const userRole = localStorage.getItem('user_role') || ''

    const handleReserve = (space) => {
        if (userRole === 'admin') {
            setAlert({ message: 'Los administradores no pueden reservar espacios.', severity: 'warning' })
            return
        }
        setAlert({ message: `Reservar espacio: ${space.name}`, severity: 'info' })
    }

    const handleEdit = (space) => {
        if (userRole !== 'admin') {
            setAlert({ message: 'Solo los administradores pueden editar espacios.', severity: 'warning' })
            return
        }
        setAlert({ message: `Editar espacio: ${space.name}`, severity: 'info' })
    }

    const handleDelete = async (space) => {
        if (userRole !== 'admin') {
            setAlert({ message: 'Solo los administradores pueden eliminar espacios.', severity: 'warning' })
            return
        }
        const token = localStorage.getItem('auth_token')
        try {
            await axios.delete(`${BASE_URL}/spaces/${space._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSpaces(spaces.filter(s => s._id !== space._id))
            setAlert({ message: `Espacio ${space.name} eliminado correctamente.`, severity: 'success' })
        } catch (err) {
            console.error('Error al eliminar espacio:', err)
            setAlert({ message: 'Error al eliminar espacio', severity: 'error' })
        }
    }

    return (
        <div className="p-4 space-y-4">
            {alert.message && (
                <Alert
                    severity={alert.severity}
                    onClose={() => setAlert({ message: '', severity: '' })}
                    className="mb-4"
                >
                    {alert.message}
                </Alert>
            )}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-center w-full">
                    Hola {userName}!<br />
                    {spaces.length === 0 ? (
                        <span className="block text-base text-gray-500 mt-2">
                            No hay espacios disponibles por el momento.
                        </span>
                    ) : (
                        <> Espacios disponibles: {spaces.length}</>
                    )}
                </h1>
            </div>
            <div className="border-b border-gray-200 mb-4 pb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={() => navigate(`/myreservations`)}
                        className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-secondary"
                    >
                        Mis reservas
                    </button>

                    {localStorage.getItem('user_role') === 'admin' && (
                        <>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-secondary"
                            >
                                Agregar espacio
                            </button>

                            <button
                                onClick={() => navigate('/create-admin')}
                                className="bg-secondary text-white px-4 py-2 rounded-xl hover:bg-primary"
                            >
                                Crear usuario administrador
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {spaces.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 mt-8">
                        No hay espacios disponibles.
                    </p>
                ) : (
                    spaces.map(space => (
                        <SpaceCard
                            key={space._id}
                            space={space}
                            userRole={userRole}
                            onReserve={handleReserve}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            <AddSpaceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchSpaces}
            />
            <button
                onClick={() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_name');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_id');
                    navigate('/login');
                }}
                className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
                Cerrar sesión
            </button>
        </div>
    )
}