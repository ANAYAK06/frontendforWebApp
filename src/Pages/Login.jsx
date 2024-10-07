import React, { useState } from 'react'
import { TbHexagonLetterS } from "react-icons/tb";

function Login({onLogin}) {

    const [email, setEmail] = useState('');
    const [password, setPassword]= useState('');

    const handleSubmit = (e)=>{
        e.preventDefault();

        onLogin(email,password)
    }






  return (
    <>
   <div className='min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
    <div className='sm:mx-auto sm:w-full sm:max-w-md'>
    <TbHexagonLetterS className='mx-auto h-12 w-auto text-indigo-700' />
    <h2 className='mt-6 text-center text-3xl font-extrabold text-indigo-700'>Log in to Your Account</h2>

    </div>
    <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <form onSubmit={handleSubmit} className='space-y-6' method='POST'>
                <div>
                    <label  htmlFor ="email" className='block text-sm font-medium text-gray-700'>Email</label>

                
                <div className="mt-1">
                    <input type="email" id='email' name='email' autoComplete='email' required value={email}
                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm placeholder:bg-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm '
                    onChange={(e)=>setEmail(e.target.value)} />
                </div>
                </div>
                <div>
                    <label  htmlFor ="Password" className='block text-sm font-medium text-gray-700'>Password</label>

                
                     <div className="mt-1">
                    <input type="password" id='password' name='password'  required
                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm placeholder:bg-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm '
                    value={password} onChange={(e)=>setPassword(e.target.value)} />
                    </div>
                </div>
                <div className='flex items-center justify-between'>
                    <div className="text-sm">
                        
                        <button  className='font-medium text-indigo-600 hover:text-indigo-500'>Forgot Password?</button>
                    </div>

                </div>
                <div>
                    <button type='submit' className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 '>Log In</button>
                </div>

            </form>

        </div>

    </div>

   </div>
   <div className='flex items-center justify-center'>
    <p>
        
    </p>

   </div>
   </>
  )
}

export default Login
