import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import { resetCart } from "../../slices/cartSlice";


const {COURSE_PAYMENT_API} = studentEndpoints;



export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector("POST", COURSE_PAYMENT_API, 
            { courses },
            {
                Authorization: `Bearer ${token}`,
            });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Enrollment Successful, you are added to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    } catch (error) {
        console.log("ENROLLMENT API ERROR.....", error);
        toast.error("Could not enroll in course");
    }
    toast.dismiss(toastId);
}

