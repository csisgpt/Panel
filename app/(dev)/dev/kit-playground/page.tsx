import { notFound } from "next/navigation";
import { KitPlayground } from "./kit-playground";

export default function KitPlaygroundPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND !== "1") {
    notFound();
  }
  return <KitPlayground />;
}
