import axios from "axios"
import { useEffect,useState } from "react"

export const Balance = () => {
    const [balance, setBalance] = useState(0);

    useEffect(()=>{
        axios
        .get("https://paysy-app.onrender.com/api/v1/account/balance",{
            headers:{
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        }).then((response)=>{
            setBalance(Math.ceil(response.data.balance*100))
        })
    },[])
    return <div className="flex">
        <div className="font-bold text-lg">
            Your balance
        </div>
        <div className="font-semibold ml-4 text-lg">
            Rs {balance/100}
        </div>
    </div>
}