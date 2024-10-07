
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMenu } from '../Slices/userMenuSlices'
import { CiSearch } from "react-icons/ci";
import { FaRegBell } from "react-icons/fa";
import { IoMailOpenOutline } from "react-icons/io5";
import { TbHexagonLetterS } from "react-icons/tb";
import { useNavigate } from 'react-router-dom'
import { TfiAnnouncement } from "react-icons/tfi";
import { fetchNotificationCount, updateNotificationCount } from '../Slices/notificationSlices'
import { Link } from 'react-router-dom';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import Trackchatbot from './Trackchatbot';





function Navbar({ isLoggedIn, userName, roleName, onLogout }) {

  const dispatch = useDispatch()
  const history = useNavigate()

  
  const [searchQuery, setSearchQuery] = useState('')
  const [submenuItem, setSubmenuItem] = useState([])
  const [filteredSubmenuItems, setFilteredSubmenuItems] = useState([])
  const [isTrackBotOpen, setIsTrackBotOpen] = useState(false);


  const userRoleId = useSelector(state => state.auth.userInfo.roleId)
  const userMenu = useSelector(state => state.userMenu.userMenu);
  const notificationCount = useSelector(state => state.notification.notificationCount)

  console.log( 'Track chat bot', Trackchatbot)


  useEffect(() => {

    dispatch(fetchUserMenu({ userRoleId }))
    dispatch(fetchNotificationCount({ userRoleId }))

    const eventSource = new EventSource(`/see/notification?userRoleId=${userRoleId}`)

    eventSource.onopen = () => {
      console.log('SSE Connection opend')
    }

    eventSource.onmessage = (event) => {
      console.log('SSE message Received:', event.data)
      const data = JSON.parse(event.data)
      console.log('Parsed SSE data:', data);
      dispatch(updateNotificationCount(data))
    }
    eventSource.onerror = (error) => {
      console.error('Event sources error', error)
      eventSource.close();
    }

    return () => {
      eventSource.close();
    }




  }, [dispatch, userRoleId])



  useEffect(() => {
    const interVal = setInterval(() => {
      dispatch(fetchNotificationCount({ userRoleId }))
    }, 10000)

    return () => clearInterval(interVal)
  }, [dispatch, userRoleId])


  useEffect(() => {
    if (userMenu && userMenu.length > 0) {
      const submenu = userMenu.map(item => item.submenuItems).flat()
      setSubmenuItem(submenu)
    }
  }, [userMenu])





  const handleSearch = (query) => {
    setSearchQuery(query);

    const filteredItems = submenuItem.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubmenuItems(filteredItems)
  }

  const handleItemClick = (path) => {
    setSearchQuery('')
    setFilteredSubmenuItems([])
    history(path)
  }



  return (
    <nav className='p-4 bg-slate-100 shadow-md'>
      <div className='max-w-7x1 flex justify-between items-center right-0'>
        <div className=''>
          <TbHexagonLetterS className='mx-auto h-12 w-auto text-indigo-700' />
        </div>
        <div>
          <div className='flex item-center border border-solid border-gray-300 rounded-lg px-4 py-2 bg-white'>
            <CiSearch className='text-blue text-xl mr-2' />
            <input type="text" placeholder='Search Function/Report' className='focus:outline-none' onChange={(e) => handleSearch(e.target.value)} value={searchQuery} />


          </div>

          <div className={`bg-white px-4 py-2 absolute w-60  rounded-md shadow-lg mt-1 z-10 ring-1 ring-black ring-opacity-5  ${!searchQuery && "hidden"} `}>
            <ul >
              {
                searchQuery && (
                  <>
                    {
                      filteredSubmenuItems.map((item) => (
                        <li key={item.path} className=' hover:bg-indigo-200  px-1 rounded-md py-1 text-indigo-800 cursor-pointer ' onClick={() => { handleItemClick(item.path) }} >

                          {item.title}

                        </li>
                      ))
                    }
                  </>
                )
              }


            </ul>

          </div>

        </div>

        {
          isLoggedIn && (


            <div className='flex'>
              <p className='text-blue mr-4 font-semibold'>{roleName}</p>
              <p className='text-blue mr-4 font-semibold'>{userName}</p>
              <div className='w-8 h-8 bg-white flex rounded-full overflow-hidden border-2 border-solid border-blue'>
                <img src="profile.jpg" alt="" className='rounded-full w-full h-full' />
              </div>


            </div>
          )
        }







        <div className='flex justify-between items-center '>
          <button className='block rounded-full items-center text-center border mx-4 p-2 shadow focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-slate-200 '><TfiAnnouncement className=' text-xl text-blue text-center ' /></button>
          <button className='block rounded-full items-center text-center border mx-4 p-2 shadow focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-slate-200'><FaRegBell className=' text-xl text-blue text-center ' /></button>
          <div className='relative inline-block mr-2'>
            <button className='block rounded-full items-center text-center border border-indigo-600 mx-4 p-2 shadow focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-slate-200' ><Link to={'/openinbox'}><IoMailOpenOutline className='text-xl text-blue text-center' /></Link></button>
            {
              notificationCount.count > 0 &&
              <span className='top-0 absolute right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full'>
                {notificationCount.count}

              </span>


            }


          </div>
          <button
            onClick={() => setIsTrackBotOpen(true)}
            className='block rounded-full items-center text-center border mx-4 p-2 shadow focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-slate-200'
          >
            <IoChatbubbleEllipsesOutline className='text-xl text-blue text-center' />
          </button>


          {
            isLoggedIn ? (
              <button onClick={onLogout} className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:bg-red-700'>Logout</button>

            ) : (null)
          }





        </div>




      </div>
     {
      isLoggedIn &&  (
        <Trackchatbot isOpen= {isTrackBotOpen} onClose ={()=>setIsTrackBotOpen(false)} />
      )
     }

      

      



    </nav>
  )
}

export default Navbar
