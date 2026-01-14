import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  //  Remove the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0), // immediately expires
    path: "/",
  });

  return response;
}


// const handleLogout = async () => {
//   await fetch("/api/auth/logout", { method: "POST" });
//   router.push("/auth/login");
// };
