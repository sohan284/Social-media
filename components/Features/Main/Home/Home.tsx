import React from 'react';
import Post from '../Post/Post';
import Story from '../Story/Story';

const Home = () => {
    return (
        <div className='px-4 md:px-6 xl:px-10'>
            <Story />
            <Post />
        </div>
    );
};

export default Home;