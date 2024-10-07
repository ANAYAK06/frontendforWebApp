import { GiMoneyStack } from "react-icons/gi";
import { FiShoppingCart } from "react-icons/fi";
import { CiStickyNote } from "react-icons/ci";
import { MdPeople } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import {RiDashboardFill} from 'react-icons/ri'
import { GiReceiveMoney } from "react-icons/gi";
import { GiPayMoney } from "react-icons/gi";
import { FaFileInvoice } from "react-icons/fa";
import { TbBuildingWarehouse } from "react-icons/tb";

    const menu = [
        {title: "Dashboard",
        icon:<RiDashboardFill />,
        path:"/"},
        {title:"Accounts",
        icon:<GiMoneyStack />,

        submenu:true,
        submenuItems:[
            {title:"Payments", submenu:true, submenuItems:[
                {title:"Cash Payments" , path:"/cashvouchers"},
                {title:"Bank Payments" , path:"/bankvouchers"}
            ] },
            {title:"Receipts", submenu:true, submenuItems:[
                {title:"Client Receipts", path:"/clientreceipts"},
                {title:"Asset Sales", path:"/assetsalesreceipts"},
                {title:"Other Receipts", path:"/otherreceipts"}
            ] }
        ]

    },
    {title: "Purchase", icon:<FiShoppingCart />,
    submenu:true,
    submenuItems:[
        {title:"Indents", submenu:true, submenuItems:[
            {title:"New Indents" , path:"/newindent"},
            {title:"Amend Indents" , path:"/amendindent"},
        ] },
        {title:"Purchase Orders" , submenu:true, submenuItems:[
            {title:"Supplier PO", path:"/supplierPO"}, 
            {title:"Service Provider PO", path:"/sppo"}]},
        {title:"Vendor Registration" }
    ] },
    {title: "Sales", icon:<CiStickyNote />,  submenu:true,
    submenuItems:[
        {title:"Client Work orders", submenu:true , submenuItems:[
            {title:"Client PO", path:"/clientpo"}
        ]},
        {title:"Sales Invoices" },
        {title:"Purchase Orders" }
    ] },
    {title: "Human Resources", icon:<MdPeople />, submenu:true,
    submenuItems:[
        {title:"Employee Join",  },
        {title:"Employee Resignation" },
    ] },
    {title: "Reports", icon:<TbReportSearch />, submenu:true,
    submenuItems:[
       {title:"PO and Work Orders", submenu:true, submenuItems: [
        {title:"Supplier PO", },
        {title:"Service Provider PO", },
        {title:"Client PO", }
       ]}
    ] },
    {title: "Settings", icon:<IoSettingsOutline />,
    submenu:true,
    submenuItems:[
        {title:"Admin Configurations",  },
        {title:"App Configurations", }
    ] },

    ]

    export default menu