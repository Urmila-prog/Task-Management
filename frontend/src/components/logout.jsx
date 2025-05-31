import React from "react";
import { googleLogout } from "@react-oauth/google";

const clientId ='525169556176-jfo2jpkugogi7p313du4ftd4uf15hjm5.apps.googleusercontent.com';

function Logout() {
    const onSuccess = () => {
        googleLogout();
        alert('logout made successfully');
    };

    return (
        <div>
            <button onClick={onSuccess} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Logout
            </button>
        </div>
    );
}

export default Logout;