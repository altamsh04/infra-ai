import { handleSsoCallback } from "@clerk/nextjs/server";

export const GET = handleSsoCallback();
export const POST = handleSsoCallback(); 