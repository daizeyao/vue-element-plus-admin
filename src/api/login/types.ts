export type UserLoginType = {
  username: string
  password: string
  email: string
}

export type UserType = {
  username: string
  password: string
  role: string
  permissions: string | string[]
}
