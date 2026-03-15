import { redirect } from "next/navigation";

// /products → /shop redirect
export default function ProductsRedirect() {
 redirect("/shop");
}
