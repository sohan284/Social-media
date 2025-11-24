"use client";
import Image from 'next/image';
import React from 'react';
import { IoImageOutline } from 'react-icons/io5';

interface ProfileHeaderProps {
    onAvatarClick: () => void;
}

const ProfileHeader = ({ onAvatarClick }: ProfileHeaderProps) => {
    return (
        <div>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <div className='relative'>
                    <Image src="/profile.jpg" alt="profile" width={60} height={60} className='rounded-full object-cover' />
                    <button 
                        onClick={onAvatarClick}
                        className='bg-[#06133F]/75 backdrop-blur-[17.5px] hover:bg-[#06133F]/90 transition-all duration-300 text-white p-2 rounded-full absolute -bottom-1 -right-2 cursor-pointer'
                    >
                        <IoImageOutline size={16} />
                    </button>
                </div>
                <div>
                    <h1 className='text-2xl font-bold text-white'>John Doe</h1>
                    <p className='text-sm text-gray-400 font-semibold'>john.doe@example.com</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;