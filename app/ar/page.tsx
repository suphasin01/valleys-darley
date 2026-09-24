import type { Metadata } from "next";
import ARExperience from "./ARExperience";
import { getLocale } from "../lib/locale";

export const metadata: Metadata = {
  title: "AR Try-On | Valley's Darley",
  description: "ลองสวมเครื่องประดับ Valley's Darley ผ่านกล้องมือถือด้วย AR",
};

export default async function ARPage() {
  return <ARExperience locale={await getLocale()} />;
}
