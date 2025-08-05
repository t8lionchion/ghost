"use clients"
import { AfterLogin } from "./after_login"
import {BeforeLogin} from "./before_login"
import { Header } from "../../components/header"
export function Accounts(){
    return(
        <>
            <Header/>
            <BeforeLogin/>
            
        </>
    )
}
export default Accounts