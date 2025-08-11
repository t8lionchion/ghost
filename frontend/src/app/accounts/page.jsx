"use client"

import { AfterLogin } from "./after_login"
import { BeforeLogin } from "./before_login"
import { Header } from "../../components/header"
import { useAuth } from "@/hooks/useAuth"

export default function Accounts() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Header />
      {isAuthenticated ? <AfterLogin /> : <BeforeLogin />}
    </>
  )
}
