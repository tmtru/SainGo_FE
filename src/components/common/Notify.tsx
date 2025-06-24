import { toast, ToastOptions, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type NotifyProps = {
    msg: string;
    isSuccess?: boolean;
    options?: ToastOptions;
};

const notify = ({ msg, isSuccess = true, options }: NotifyProps) => {
    const config: ToastOptions = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        ...options,
    };

    if (isSuccess) {
        toast.success(msg, config);
    } else {
        toast.error(msg, config);
    }
};

export const NotifyContainer = ToastContainer;
export default notify;
