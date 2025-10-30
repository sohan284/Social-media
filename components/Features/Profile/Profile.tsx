"use client";
import React, { useState } from 'react';
import ProfileHeader from './_components/ProfileHeader';
import AvatarModal from './_components/AvatarModal';
import Post from '../Main/Post/Post';
import ProfileSidebar from './_components/ProfileSidebar';

const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div className='max-w-[1220px] mx-auto flex gap-10 pt-6 lg:p-4 '>
                <div className='w-full min-h-[] bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-4 xl:p-10 '>
                    <div className='border-b border-white/10 pb-4'>
                        <ProfileHeader onAvatarClick={openModal} />
                        <div className='flex items-center gap-2 mt-4 overflow-x-hidden'>
                            <button onClick={() => setActiveTab('overview')} className={`px-6 py-3  rounded-lg cursor-pointer ${activeTab === 'overview' ? 'bg-white text-black' : 'border border-white/10 text-white'}`}>Overview</button>
                            <button onClick={() => setActiveTab('posts')} className={`px-6 py-3  rounded-lg cursor-pointer ${activeTab === 'posts' ? 'bg-white text-black' : 'border border-white/10 text-white'}`}>Posts</button>
                        </div>
                    </div>

                    <div className='mt-6 space-y-6'>
                        <Post />
                        <Post />
                        <Post />
                    </div>
                </div>
                <div style={{ scrollbarGutter: "stable both-edges" }} className='h-[90vh]  hidden lg:block rounded-lg w-[500px] sticky top-18 hover:overflow-y-auto overflow-y-hidden custom-scroll'>
                    <ProfileSidebar />
                </div>
            </div>

            <AvatarModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};

export default Profile;