"use client";
import React, { useState } from 'react';
import ProfileHeader from './_components/ProfileHeader';
import AvatarModal from './_components/AvatarModal';

const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div className='max-w-[1220px] mx-auto flex gap-10 pt-6'>
                <div className='w-full h-[5000px] bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-10 '>
                    <div className='border-b border-white/10 pb-4'>
                        <ProfileHeader onAvatarClick={openModal} />
                    </div>
                </div>
                <div className='h-[90vh] bg-[#06133F]/75 backdrop-blur-[17.5px] p-4 rounded-lg w-[300px] sticky top-18'></div>
            </div>

            {/* Modal rendered at top level to cover full screen */}
            <AvatarModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};

export default Profile;