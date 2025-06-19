import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import axios from 'axios'
import { useAuthGuard } from '../../auth/useAuth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function AddSpaceModal({ isOpen, onClose, onSuccess }) {
    useAuthGuard()

    const [form, setForm] = useState({
        name: '',
        type: 'aula',
        capacity: '',
        location: ''
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        const token = localStorage.getItem('auth_token')
        try {
            await axios.post(`${BASE_URL}/spaces`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            setForm({
                name: '',
                type: 'aula',
                capacity: '',
                location: ''
            })
            onClose()
            onSuccess()
        } catch (err) {
            console.error('Error al crear espacio:', err)
            alert('Error al crear espacio')
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" leave="ease-in duration-200"
                    enterFrom="opacity-0" enterTo="opacity-100"
                    leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" leave="ease-in duration-200"
                            enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all space-y-4">
                                <Dialog.Title className="text-lg font-medium text-gray-900">
                                    Agregar nuevo espacio
                                </Dialog.Title>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nombre del espacio"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="aula">Aula</option>
                                    <option value="laboratorio">Laboratorio</option>
                                    <option value="sala">Sala</option>
                                </select>

                                <input
                                    type="number"
                                    name="capacity"
                                    placeholder="Capacidad"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Ubicación"
                                    value={form.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
