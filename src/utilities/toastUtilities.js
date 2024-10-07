// src/utils/toastUtils.js
import { toast } from 'react-toastify';

const toastConfig = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

export const showToast = (type, message) => {
    switch (type) {
        case 'success':
            toast.success(message, toastConfig);
            break;
        case 'error':
            toast.error(message, toastConfig);
            break;
        case 'info':
            toast.info(message, toastConfig);
            break;
        case 'warning':
            toast.warning(message, toastConfig);
            break;
        default:
            toast(message, toastConfig);
    }
};