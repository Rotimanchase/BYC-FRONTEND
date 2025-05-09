import React from 'react'
import TopContent from '../components/TopContent'
import NewArrivals from '../components/NewArrivals'
import BycCollection from '../components/BycCollection'
import ByCatergory from '../components/ByCatergory'
import BlogPost from '../components/BlogPost'

const Home = () => {
  return (
    <div>
      <TopContent/>
      <NewArrivals/>
      <BycCollection/>
      <ByCatergory/>
      <BlogPost/>
    </div>
  )
}

export default Home
