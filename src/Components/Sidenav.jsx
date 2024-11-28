import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector } from 'react-redux';
import {fetchUserMenu} from '../Slices/userMenuSlices'
import { BsArrowLeft } from "react-icons/bs";
import { BsChevronDown } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { MdPeople } from "react-icons/md";
import { IoConstruct } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { RiDashboardFill } from 'react-icons/ri'
import { GiReceiveMoney } from "react-icons/gi";
import { GiPayMoney } from "react-icons/gi";
import { FaFileInvoice } from "react-icons/fa";
import { TbBuildingWarehouse } from "react-icons/tb";
import { MdLibraryBooks } from "react-icons/md";
import { Link } from 'react-router-dom'
import { GrAnalytics } from "react-icons/gr";
import { FaBook } from "react-icons/fa";
import { PiGavelFill } from "react-icons/pi";

function Sidenav() {
    const dispatch = useDispatch()


   
    const [open, setOpen] = useState(true)
    const [activeMenuItem, setActiveMenuItem] = useState('Dashboard')
 
    const userRoleId = useSelector(state =>state.auth.userInfo.roleId)
    const userMenu = useSelector(state => state.userMenu.userMenu);
   
    useEffect(()=>{

        dispatch(fetchUserMenu({userRoleId}))
    
      },[dispatch,userRoleId])



    const iconComponents = {
        "RiDashboardFill": <RiDashboardFill />,
        "FiShoppingCart": <FiShoppingCart />,
        "FaFileInvoice": <FaFileInvoice />,
        "GiPayMoney": <GiPayMoney />,
        "GiReceiveMoney": <GiReceiveMoney />,
        "MdPeople": <MdPeople />,
        "TbBuildingWarehouse": <TbBuildingWarehouse />,
        "IoSettingsOutline": <IoSettingsOutline />,
        "IoConstruct":<IoConstruct />,
        "MdLibraryBooks":<MdLibraryBooks />,
        "GrAnalytics":<GrAnalytics />,
        "FaBook":<FaBook />,
        "PiGavelFill":<PiGavelFill />
    }




    const handlemenuItemClick = (title) => {
        setActiveMenuItem(title === activeMenuItem ? null : title)

    }






    return (
        <div className='flex'>
            <div className={`bg-indigo-800 min-h-screen  p-5 duration-300 pt-8 ${open ? "w-72" : "w-20"}  relative`} >
                <BsArrowLeft className={`bg-white text-indigo-800 rounded-full text-3xl absolute -right-3 border border-indigo-800 cursor-pointer ${!open && "rotate-180"}`} onClick={() => setOpen(!open)} />
                <div className='inline-flex'>
                    <h1 className={`text-white origin-left font-medium text-2xl ${!open && "scale-0"} duration-150`}>SLT APP</h1>

                </div>
                <ul className='pt-2'>
                    <li className={`'text-gray-200  flex items-center gap-x-4 cursor-pointer hover:bg-indigo-400 p-2 rounded-md mt-2 ${activeMenuItem === 'Dashboard' ? "bg-indigo-400" : ""} }`}>
                        <Link to={'/dashboard'} className={`flex items-center gap-x-4 cursor-pointer text-gray-200 `} onClick={()=>handlemenuItemClick('Dashboard')} >
                            <span className='text-2xl block float-left'><RiDashboardFill /></span>
                            <span className={`text-base font-medium flex-1 ${!open && "hidden"}`}>Dashboard</span>
                        </Link>
                    </li>
                    {

                        userMenu.map((item, index) => (
                            <React.Fragment key={index}>


                                <li key={index} className={`'text-gray-200  flex items-center gap-x-4 cursor-pointer hover:bg-indigo-400 p-2 rounded-md mt-2 ${activeMenuItem === item.title ? "bg-indigo-400" : ""}`}>
                                    <Link to={item.path} key={item.mid} className={`flex items-center gap-x-4 cursor-pointer text-gray-200 `} onClick={() => handlemenuItemClick(item.title)} >
                                        <span className='text-2xl block float-left'>{iconComponents[item.icon]}</span>
                                        <span className={`text-base font-medium flex-1 ${!open && "hidden"}`}>{item.title}</span>

                                    </Link>
                                    {
                                        item.submenu && (
                                            <BsChevronDown className={`${activeMenuItem === item.title ? "rotate-180 " : ""} text-gray-200 float-right`} />
                                        )
                                    }

                                </li>
                                {
                                    item.submenu && open && activeMenuItem === item.title && (
                                        <ul className={`${activeMenuItem === item.title ? "h-auto" : "h-0"} transition-all ease-in-out duration-300 overflow-hidden bg-indigo-700 rounded-md`}>
                                            {
                                                item.submenuItems.map((subItem, index) => (
                                                    <li key={index}>
                                                        <Link to={subItem.path} key={subItem.linkid} className='text-sm flex items-center gap-x-4 cursor-pointer p-2 text-gray-200 rounded-md hover:bg-indigo-400 px-5 mt-2 '>
                                                            {subItem.title}
                                                        </Link>


                                                    </li>

                                                ))
                                            }
                                        </ul>
                                    )
                                }
                            </React.Fragment>
                        ))
                    }

                </ul>

            </div>






        </div>
    )
}

export default Sidenav
