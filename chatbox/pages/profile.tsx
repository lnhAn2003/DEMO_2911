import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../src/hooks/useAuth';
import axiosInstance from '../src/utils/axiosInstance';

const ProfilePage: React.FC = () => {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    // State to control the modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fields for editing profile
    const [description, setDescription] = useState(user?.profileDescription || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user && token === null) {
            router.push('/login');
        }
    }, [user, token, router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    const avatarSrc = user.profileImageUrl || '/default-avatar.png';

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('profileDescription', description);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await axiosInstance.patch(`/users/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh user data
            await axiosInstance.get('/users/profile');
            window.location.reload();

            setMessage('Profile updated successfully!');
            // Close modal after a successful update
            setIsModalOpen(false);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            {/* Profile Card */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Avatar */}
                    <img
                        src={avatarSrc}
                        alt="User Avatar"
                        className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                    />

                    {/* User Info */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">{user?.name}</h1>
                        <p className="text-lg text-gray-600 mb-4">{user?.email}</p>
                        <p className="text-md text-gray-700 max-w-2xl">
                            {user?.profileDescription || 'No description provided yet.'}
                        </p>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 transition shadow"
                    >
                        Edit Profile
                    </button>

                    {/* Logout Button */}

                    <button
                        onClick={logout}
                        className="mt-4 px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>


            {/* Modal for Profile Editing */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg shadow-lg p-8 max-w-lg w-full z-10">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Edit Your Profile</h2>

                        {message && (
                            <p
                                className={`mb-4 px-4 py-2 rounded ${message.includes('success')
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}
                            >
                                {message}
                            </p>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Avatar</label>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={avatarFile ? URL.createObjectURL(avatarFile) : avatarSrc}
                                        alt="Avatar Preview"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setAvatarFile(e.target.files[0]);
                                            }
                                        }}
                                        className="text-sm text-gray-700 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Profile Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profile Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={4}
                                    placeholder="Write something about yourself..."
                                ></textarea>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ProfilePage;
