import Image from 'next/image';
import React from 'react';

const communities = [
    {
        name: 'Community 1',
        members: 1000,
        image: '/profile.jpg',
    },

    {
        name: 'Community 3',
        members: 3000,
        image: '/profile.jpg',
    },
    {
        name: 'Community 3',
        members: 3000,
        image: '/profile.jpg',
    },
]

const members = (members: number) => {
    if (members > 1000) {
        return '1k+ Members';
    } else if (members > 10000) {
        return '10k+ Members';
    } else if (members > 100000) {
        return '100k+ Members';
    }
}

const RightSidebar = () => {
    return (
        <div className=' space-y-6'>
            <div className='bg-[#06133FBF] backdrop-blur-[1px] py-6 px-4 rounded-2xl space-y-4 '>
                <h1 className='text-white text-lg font-semibold'>Popular Communities</h1>
                {
                    communities.map((community, index) =>
                        <div key={index} className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Image src="/profile.jpg" alt="Profile" width={50} height={50} className='rounded-full object-cover' />
                                <div>
                                    <h3 className='text-white text-sm font-semibold'>John Doe</h3>
                                    <p className='text-gray-400 text-sm'>{members(community.members)} Members</p>
                                </div>
                            </div>
                            <button className='text-white px-4 py-2 hover:text-slate-400 duration-300 ease-in-out cursor-pointer'> Join</button>
                        </div>)
                }
            </div>
            <div className='bg-[#06133FBF] backdrop-blur-[1px] py-6 px-4 rounded-2xl space-y-4 '>
                <h1 className='text-white text-lg font-semibold'>Popular Categories
                </h1>
                {
                    communities.map((community) => <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Image src="/profile.jpg" alt="Profile" width={50} height={50} className='rounded-full object-cover' />
                            <div>
                                <h3 className='text-white text-sm font-semibold'>John Doe</h3>
                                <p className='text-gray-400 text-sm'>{members(community.members)} Members</p>
                            </div>
                        </div>
                        <button className='text-white px-4 py-2 hover:text-slate-400 duration-300 ease-in-out cursor-pointer'> Join</button>
                    </div>)
                }
            </div>
        </div>
    );
};

export default RightSidebar;