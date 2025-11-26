import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { IoImageOutline } from 'react-icons/io5';

const ProfileSidebar = () => {
    const router = useRouter();
    const { data: profileResponse, isLoading: isProfileLoading } = useGetCurrentUserProfileQuery();
    const profile = profileResponse?.data;
    return (
        <div className='space-y-4'>
            <div className='bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-2xl'>
                <div className='relative'>
                    <Image src={profile?.cover_photo || "/post.jpg"} alt="Cover Image" width={500} height={500} className='rounded-t-2xl h-32 object-cover' />
                    <button
                        onClick={() => router.push('/main/edit-profile')}
                        className='bg-[#06133F]/75 backdrop-blur-[17.5px] hover:bg-[#06133F]/90 transition-all duration-300 text-white p-2 rounded-full absolute bottom-4 right-4 cursor-pointer'
                    >
                        <IoImageOutline size={16} />
                    </button>
                </div>
                <div className='p-4'>
                    <div className='mb-4'>
                        <h3 className='font-semibold text-white'>{profile?.display_name || profile?.username || "Name Of the profile"}</h3>
                        <p className='text-sm text-gray-400'>Followers: {profile?.followers_count || 0}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className='text-xs text-gray-400'>Total Posts</p>
                            <p className='text-xs font-bold text-white'>{profile?.posts_count || 0}</p>
                        </div>
                        <div>
                            <p className='text-xs text-gray-400'>Total followers</p>
                            <p className='text-xs font-bold text-white'>{profile?.followers_count || 0}</p>
                        </div>
                        <div>
                            <p className='text-xs text-gray-400'>Share</p>
                            <p className='text-xs font-bold text-white'>{profile?.shares_count || 0}</p>
                        </div>
                        <div>
                            <p className='text-xs text-gray-400'>Total Contributors</p>
                            <p className='text-xs font-bold text-white'>{profile?.contributors_count || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-2xl p-4'>
                <h3 className='text-white text-lg font-semibold mb-4'>Settings</h3>
                <div className='space-y-4'>
                    {/* Profile Option */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                                <Image src={profile?.avatar || "/profile.jpg"} alt="profile" width={32} height={32} className='rounded-full object-cover' />
                            </div>
                            <div>
                                <h4 className='text-white font-medium'>Profile</h4>
                                <p className='text-gray-400 text-sm'>Customize your profile.</p>
                            </div>
                        </div>
                        <button className='text-white text-sm hover:text-gray-300 transition-colors'>
                            Update
                        </button>
                    </div>

                    {/* Avatar Option */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center p-2'>
                                <IoImageOutline size={16} />
                            </div>
                            <div>
                                <h4 className='text-white font-medium'>Avatar</h4>
                                <p className='text-gray-400 text-sm'>Edit your avatar or upload an image.</p>
                            </div>
                        </div>
                        <button className='text-white text-sm hover:text-gray-300 transition-colors'>
                            Update
                        </button>
                    </div>

                    {/* Curate Profile Option */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center p-2'>
                                <IoImageOutline size={16} />
                            </div>
                            <div>
                                <h4 className='text-white font-medium'>Curate your profile</h4>
                                <p className='text-gray-400 text-sm'>Manage what people see when they visit your profile.</p>
                            </div>
                        </div>
                        <button className='text-white text-sm hover:text-gray-300 transition-colors'>
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;